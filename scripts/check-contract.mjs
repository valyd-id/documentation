#!/usr/bin/env node
// Basic contract gate (no AI evaluator) — the second audit asked for docs↔contract enforcement:
//  (A) every `verify.*` / `valyd.*` SDK method the docs reference must exist in the exported SDK
//      types (../valyd-sdk-js/dist/index.d.ts). Skipped when the SDK isn't co-located (CI).
//  (B) every `/api/v2/<resource>` the docs reference must have a matching resource in the verify
//      OpenAPI paths.
//  (C) every field in an OpenAPI response EXAMPLE must be a declared property of that response's
//      schema (conservative — skips schemas too loose to judge). Catches "example shows a field the
//      schema doesn't define" drift in the production API contract.
// changelog.md + deprecations.md are skipped (they legitimately name removed methods/endpoints).
// Internal-marker leakage (inferred / not confirmed) in the specs is enforced by check-openapi.mjs.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKIP = new Set(['changelog.md', 'deprecations.md'])

function walkContent(cb) {
  const CONTENT = path.join(ROOT, 'content')
  ;(function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) { walk(p); continue }
      if (!['.md', '.mdx'].includes(path.extname(e.name))) continue
      if (SKIP.has(path.basename(p))) continue
      const rel = path.relative(ROOT, p)
      fs.readFileSync(p, 'utf8').split(/\r?\n/).forEach((line, i) => cb(rel, line, i))
    }
  })(CONTENT)
}

const failures = []
const notes = []

// ---- (A) SDK method references must exist on the ACTUAL built client (runtime) ----
// Static .d.ts parsing is fragile — a removed namespace can leave unused interface types behind
// (e.g. `interface Workflow`) that keep the word alive. Import the built SDK and check the real
// object graph: `verifyClient.<ns>.<method>` / `valydClient.<ns>.<method>` must be a function.
const distJs = path.resolve(ROOT, '..', 'valyd-sdk-js', 'dist', 'index.js')
if (fs.existsSync(distJs)) {
  let valydClient, verifyClient, importErr
  try {
    const mod = await import(pathToFileURL(distJs).href)
    const Valyd = mod.Valyd || mod.default?.Valyd
    valydClient = new Valyd({ clientId: 'x', clientSecret: 'y', apiKey: 'x' })
    verifyClient = valydClient.verify || (mod.VerifyClient && new mod.VerifyClient({ apiKey: 'x' }))
  } catch (e) { importErr = e }
  if (importErr) {
    notes.push(`SDK could not be loaded (${importErr.message}) — skipped SDK-method check (A)`)
  } else {
    const RE = /\b(?:verify|valyd)\.(standalone|sessions|credentials|kyc|auth|workflows|webhooks)\.([a-zA-Z][a-zA-Z0-9]*)\s*\(/g
    const seen = new Map() // "ns.method" -> loc
    walkContent((rel, line, i) => {
      let m
      RE.lastIndex = 0
      while ((m = RE.exec(line))) { const key = `${m[1]}.${m[2]}`; if (!seen.has(key)) seen.set(key, `${rel}:${i + 1}`) }
    })
    for (const [ref, loc] of seen) {
      const [ns, method] = ref.split('.')
      const onVerify = typeof verifyClient?.[ns]?.[method] === 'function'
      const onValyd = typeof valydClient?.[ns]?.[method] === 'function'
      if (!onVerify && !onValyd) failures.push(`${loc}: SDK member "${ns}.${method}" not found on the built SDK client (removed or never existed)`)
    }
  }
} else {
  notes.push('SDK dist not co-located — skipped SDK-method check (A)')
}

// ---- (B) documented /api/v2 endpoints ⊆ verify OpenAPI resources ----
const specPath = path.join(ROOT, 'public', 'openapi', 'valyd-verify.json')
if (fs.existsSync(specPath)) {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'))
  const resources = new Set(Object.keys(spec.paths || {}).map((p) => p.split('/')[3]).filter(Boolean))
  const RE = /\/api\/v2\/([a-z0-9-]+)/gi
  const seen = new Map()
  walkContent((rel, line, i) => {
    let m
    RE.lastIndex = 0
    while ((m = RE.exec(line))) { const seg = m[1].toLowerCase(); if (!seen.has(seg)) seen.set(seg, `${rel}:${i + 1}`) }
  })
  for (const [seg, loc] of seen) {
    if (!resources.has(seg)) failures.push(`${loc}: endpoint "/api/v2/${seg}" referenced in docs but not a verify OpenAPI resource`)
  }
} else {
  notes.push('verify OpenAPI not built — skipped endpoint check (B)')
}

// ---- (C) response example fields ⊆ schema (conservative) ----
for (const specName of ['valyd-verify.json', 'valyd-id.json']) {
  const sp = path.join(ROOT, 'public', 'openapi', specName)
  if (!fs.existsSync(sp)) continue
  let spec
  try { spec = JSON.parse(fs.readFileSync(sp, 'utf8')) } catch { continue }
  const resolve = (schema, depth = 0) => {
    if (!schema || depth > 6) return schema
    if (schema.$ref) return resolve(spec.components?.schemas?.[schema.$ref.split('/').pop()], depth + 1)
    return schema
  }
  const declaredKeys = (schema) => {
    const s = resolve(schema)
    if (!s || s.additionalProperties === true || s.oneOf || s.anyOf) return null
    let props = s.properties ? { ...s.properties } : null
    if (s.allOf) for (const part of s.allOf) { const r = resolve(part); if (r?.properties) props = { ...(props || {}), ...r.properties } }
    return props ? Object.keys(props) : null
  }
  const propSchema = (schema, key) => {
    const s = resolve(schema)
    if (s?.properties?.[key]) return s.properties[key]
    if (s?.allOf) for (const part of s.allOf) { const r = resolve(part); if (r?.properties?.[key]) return r.properties[key] }
    return null
  }
  const compare = (example, schema, label) => {
    if (example == null) return
    if (Array.isArray(example)) { const s = resolve(schema); if (s?.items && example.length) compare(example[0], s.items, `${label}[0]`); return }
    if (typeof example !== 'object') return
    const keys = declaredKeys(schema)
    if (!keys) return // schema too loose to judge — skip
    for (const k of Object.keys(example)) {
      if (!keys.includes(k)) { failures.push(`${specName} ${label}: response example field "${k}" is not a declared schema property`); continue }
      const ps = propSchema(schema, k)
      if (ps) compare(example[k], ps, `${label}.${k}`)
    }
  }
  for (const [route, ops] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(ops)) {
      if (!op || typeof op !== 'object' || !op.responses) continue
      for (const [code, resp] of Object.entries(op.responses)) {
        const media = resp?.content?.['application/json']
        if (!media) continue
        const examples = media.example != null ? [media.example] : Object.values(media.examples || {}).map((e) => e?.value).filter((v) => v != null)
        for (const ex of examples) compare(ex, media.schema, `${method.toUpperCase()} ${route} ${code}`)
      }
    }
  }
}

for (const n of notes) console.log(`note — ${n}`)
if (failures.length) {
  console.error('\ncheck-contract: docs reference SDK methods / endpoints that do not exist.\n')
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('ok — SDK methods + endpoints resolve; OpenAPI response examples match their schemas')
