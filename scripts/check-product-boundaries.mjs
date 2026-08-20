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
    if (entry.isDirectory()) await walk(next)
    else if (/\.(md|mdx|tsx|ts|json|txt)$/.test(entry.name)) files.push(next)
  }
}

for (const relative of roots) await walk(relative)

const forbidden = [
  // errors.md legitimately documents the 410 'endpoint_removed' migration hint,
  // and its catalog is GENERATED from backend messages — exempt it.
  { pattern: /\btpsso\b/i, message: 'removed auth terminology', exempt: ['content/docs/errors.md', 'content/docs/deprecations.md'] },
  { pattern: /\/api\/auth\/tpsso/i, message: 'removed auth namespace', exempt: ['content/docs/deprecations.md'] },
  { pattern: /https:\/\/idp\.valyd\.work\/auth\?/i, message: 'non-canonical authorize URL' },
  { pattern: /npm (?:i|install) @valyd\/sdk(?!@\^1\.10\.2)/, message: 'unpinned or stale SDK install command' },
  { pattern: /@valyd\/sdk (?:1\.10\.x|1\.11)\+?/i, message: 'stale SDK version guidance' },
  { pattern: /@valyd\/sdk@x\.y\.z/i, message: 'placeholder SDK version' }
]

const failures = []
for (const relative of files) {
  const body = await fs.readFile(path.join(root, relative), 'utf8')
  for (const rule of forbidden) {
    if (rule.exempt?.includes(relative)) continue
    if (rule.pattern.test(body)) failures.push(`${relative}: ${rule.message}`)
  }
}

// Anchors of the product-boundary story. Keep these in sync with deliberate
// copy changes — the point is to catch ACCIDENTAL drift, not to freeze prose.
const required = [
  // Login section: reads the account, never runs a check.
  ['content/docs/index.md', 'read what the account already holds'],
  ['content/docs/introduction.md', 'Account API never runs a check'],
  // Verify section: API-key checks, account attach is optional.
  ['content/verifications/index.md', 'X-API-Key'],
  ['content/verifications/index.md', 'valyd_access_token'],
  ['content/verifications/managed.md', 'valyd_access_token'],
  ['content/verifications/quickstart.md', 'being checked never does'],
  // SDK version pin.
  ['content/docs/quick-start.md', '@valyd/sdk@^1.10.3'],
  ['content/verifications/sdk.md', '@valyd/sdk@^1.10.3'],
]

for (const [relative, phrase] of required) {
  const body = await fs.readFile(path.join(root, relative), 'utf8')
  if (!body.includes(phrase)) failures.push(`${relative}: missing required product-boundary phrase: ${phrase}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`ok — checked ${files.length} source files; login and verification boundaries are explicit`)
