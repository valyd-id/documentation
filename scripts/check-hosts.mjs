#!/usr/bin/env node
// Build gate: fail if a FOREIGN environment host leaked into this build.
//
// Each environment must only reference its own hosts (docs/idp/dev.valyd.<tld>).
// A .work build that ships a docs.valyd.vip URL — the DOCS-000 bug — is a hard
// error here, so it can never reach production again.
//
// Runs in postbuild against the generated corpus (public/) and the rendered
// pages (.next/server/app). Only host prefixes are checked, so brand emails
// like support@valyd.id are never flagged.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Load NEXT_PUBLIC_DOCS_URL from env/.env to learn this build's TLD.
let docsUrl = process.env.NEXT_PUBLIC_DOCS_URL
if (!docsUrl) {
  try {
    const env = await fs.readFile(path.join(ROOT, '.env'), 'utf8')
    docsUrl = env.match(/^\s*NEXT_PUBLIC_DOCS_URL\s*=\s*(.+)\s*$/m)?.[1]?.replace(/^["']|["']$/g, '')
  } catch { /* fall through */ }
}
docsUrl ||= 'https://docs.valyd.work'
const ownTld = docsUrl.replace(/^https?:\/\/[^.]+\.valyd\./, '').replace(/\/.*$/, '') // work|vip|id

const ALL_TLDS = ['work', 'vip', 'id']
const foreign = ALL_TLDS.filter(t => t !== ownTld)
// Match a real HOST prefix only (docs/idp/dev), so emails (support@valyd.id) are safe.
const re = new RegExp(`(?:docs|idp|dev)\\.valyd\\.(?:${foreign.join('|')})\\b`)

async function* walk(dir) {
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}

const TARGETS = ['public/docs', 'public/verify', 'public/openapi', '.next/server/app']
const SINGLES = ['public/llms.txt', 'public/llms-full.txt', 'public/robots.txt']

const hits = []
for (const rel of SINGLES) {
  try {
    const txt = await fs.readFile(path.join(ROOT, rel), 'utf8')
    const m = txt.match(re)
    if (m) hits.push(`${rel}: ${m[0]}`)
  } catch { /* missing is fine */ }
}
for (const dir of TARGETS) {
  for await (const file of walk(path.join(ROOT, dir))) {
    if (!/\.(md|json|html|txt|js)$/.test(file)) continue
    const txt = await fs.readFile(file, 'utf8')
    const m = txt.match(re)
    if (m) hits.push(`${path.relative(ROOT, file)}: ${m[0]}`)
  }
}

if (hits.length) {
  console.error(`\n[check-hosts] FAIL — this is a "${ownTld}" build but it contains foreign hosts:`)
  for (const h of [...new Set(hits)].slice(0, 25)) console.error('  ✗ ' + h)
  console.error(`\nExpected only *.valyd.${ownTld}. Fix the source (a hardcoded host in a component,`)
  console.error('or a stale .next cache) and rebuild.\n')
  process.exit(1)
}
console.log(`[check-hosts] OK — no foreign hosts in this ${ownTld} build.`)
