#!/usr/bin/env node
// Basic contract gate (no AI evaluator) — the second audit asked for docs↔contract enforcement:
//  (A) every `verify.*` / `valyd.*` SDK method the docs reference must exist in the exported SDK
//      types (../valyd-sdk-js/dist/index.d.ts). Skipped when the SDK isn't co-located (CI).
//  (B) every `/api/v2/<resource>` the docs reference must have a matching resource in the verify
//      OpenAPI paths.
// changelog.md + deprecations.md are skipped (they legitimately name removed methods/endpoints).
// Follow-ups (not yet enforced): example-response field ⊆ schema; required-param present in example.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

// ---- (A) SDK method references ⊆ exported types ----
const dts = path.resolve(ROOT, '..', 'valyd-sdk-js', 'dist', 'index.d.ts')
if (fs.existsSync(dts)) {
  const types = fs.readFileSync(dts, 'utf8')
  const RE = /\b(?:verify|valyd)\.(?:standalone|sessions|credentials|kyc|auth|workflows)\.([a-zA-Z][a-zA-Z0-9]*)\s*\(/g
  const seen = new Map()
  walkContent((rel, line, i) => {
    let m
    RE.lastIndex = 0
    while ((m = RE.exec(line))) if (!seen.has(m[1])) seen.set(m[1], `${rel}:${i + 1}`)
  })
  for (const [method, loc] of seen) {
    if (!new RegExp(`\\b${method}\\s*[(:<]`).test(types)) {
      failures.push(`${loc}: SDK method "${method}" referenced in docs but absent from exported SDK types`)
    }
  }
} else {
  notes.push('SDK types not co-located — skipped SDK-method check (A)')
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

for (const n of notes) console.log(`note — ${n}`)
if (failures.length) {
  console.error('\ncheck-contract: docs reference SDK methods / endpoints that do not exist.\n')
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('ok — SDK-method and endpoint references resolve against the SDK types + verify OpenAPI')
