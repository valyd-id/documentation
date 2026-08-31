#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const roots = ['content', 'components', 'corpus']
const files = []

async function walk(relative) {
  for (const entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
    const next = path.join(relative, entry.name)
    // corpus/openapi holds the actual API contract (internal/SDK generation) — not scanned.
    if (entry.isDirectory()) { if (next !== 'corpus/openapi') await walk(next); continue }
    if (/\.(md|mdx|tsx|ts|json|txt)$/.test(entry.name)) files.push(next)
  }
}

for (const relative of roots) await walk(relative)

// Global forbidden terminology (any file).
const HISTORY = ['content/docs/changelog.md', 'content/docs/deprecations.md']
const forbidden = [
  // errors.md legitimately documents the 410 'endpoint_removed' migration hint,
  // and its catalog is GENERATED from backend messages — exempt it.
  { pattern: /\btpsso\b/i, message: 'removed auth terminology', exempt: ['content/docs/errors.md', 'content/docs/deprecations.md'] },
  { pattern: /\/api\/auth\/tpsso/i, message: 'removed auth namespace', exempt: ['content/docs/deprecations.md'] },
  { pattern: /https:\/\/idp\.valyd\.work\/auth\?/i, message: 'non-canonical authorize URL' },
  // Docs policy: install commands are UNVERSIONED (`npm i @valyd/sdk`) so users always get the
  // latest publish and the docs never need re-stamping. Flag any version-pinned install instead.
  // changelog.md is release history and legitimately records the pinned install of older releases.
  { pattern: /npm (?:i|install) @valyd\/sdk@/, message: 'SDK install must be unversioned (npm i @valyd/sdk)', exempt: ['content/docs/changelog.md'] },
  { pattern: /@valyd\/sdk (?:1\.10\.x|1\.11)\+?/i, message: 'stale SDK version guidance' },
  { pattern: /@valyd\/sdk@x\.y\.z/i, message: 'placeholder SDK version' },
  // Retired product model (2026-08 two-product restructure): the public docs teach ONLY
  // Unique Human API + Reusable Verification. Old lane/matrix terminology is banned outside
  // history pages (changelog/deprecations).
  { pattern: /\bVerify Fresh\b/i, message: 'retired product name (use Unique Human API)', exempt: HISTORY },
  { pattern: /\bnon[- ]account\b/i, message: 'retired lane terminology', exempt: HISTORY },
  { pattern: /choose (a|your) (lane|integration)/i, message: 'retired decision-tree terminology', exempt: HISTORY },
  { pattern: /\b(a|the|which|verification) lane\b/i, message: 'retired lane terminology', exempt: HISTORY },
  { pattern: /\bLogin with Valyd\b/, message: 'renamed — use Connect with Valyd', exempt: HISTORY },
  { pattern: /\bhosted verification\b/i, message: 'retired product framing (Valyd hosts the capture page — describe the mechanic, not a product)', exempt: HISTORY },
  { pattern: /\bstandalone (check|verification|lane)s?\b/i, message: 'retired product framing (Unique Human API / workflow checks)', exempt: HISTORY },
  { pattern: /\bcore (api|verification)\b/i, message: 'retired product framing', exempt: HISTORY },
  { pattern: /\bdirect (api|verification)\b/i, message: 'retired product framing', exempt: HISTORY },
  { pattern: /\bReusable Verification API\b/, message: 'renamed — Reusable Verification (no "API")', exempt: HISTORY }
]

// SDK-ONLY enforcement: Verification is offered as a hosted flow through the SDK. The verification
// docs must NOT expose raw endpoints, request URLs, cURL, or the X-API-Key header — everything is
// managed by the SDK. Scoped to the verification product (content/verifications/**, content/verify/**).
// The OpenAPI JSON under public/ & corpus/ is kept for internal/SDK generation and is NOT scanned.
const isVerify = (rel) => rel.startsWith('content/verifications/') || rel.startsWith('content/verify/')
const verifyForbidden = [
  { pattern: /\/api\/v2\b/, message: 'raw verification endpoint path (SDK-only — no /api/v2 URLs)' },
  { pattern: /\bX-API-Key\b/, message: 'raw API-key header (SDK-only — use the SDK client)' },
  { pattern: /\bcurl\s+-/, message: 'cURL example (SDK-only — show the SDK method instead)' },
  { pattern: /idp\.valyd\.\w+\/api/, message: 'verification API host URL (SDK-only — no endpoint URLs)' },
  { pattern: /\bFull URL:/, message: 'exposed endpoint URL (SDK-only)' }
]

const failures = []
for (const relative of files) {
  const body = await fs.readFile(path.join(root, relative), 'utf8')
  for (const rule of forbidden) {
    if (rule.exempt?.includes(relative)) continue
    if (rule.pattern.test(body)) failures.push(`${relative}: ${rule.message}`)
  }
  if (isVerify(relative)) {
    for (const rule of verifyForbidden) {
      if (rule.pattern.test(body)) failures.push(`${relative}: ${rule.message}`)
    }
  }
}

// Anchors of the product-boundary story. Keep these in sync with deliberate copy changes — the
// point is to catch ACCIDENTAL drift, not to freeze prose.
const required = [
  // Connect section: reads the account, never runs a check.
  ['content/docs/index.md', 'read what the account already holds'],
  ['content/docs/endpoints.md', 'Account API never runs a check'],
  // The two products.
  ['content/verifications/index.md', 'Reusable Verification'],
  ['content/verifications/index.md', 'valyd_access_token'],
  ['content/verifications/unique-human/index.md', 'Unique Human API'],
]

for (const [relative, phrase] of required) {
  const body = await fs.readFile(path.join(root, relative), 'utf8')
  if (!body.includes(phrase)) failures.push(`${relative}: missing required product-boundary phrase: ${phrase}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`ok — checked ${files.length} source files; verification is SDK-only and boundaries are explicit`)
