#!/usr/bin/env node
// One-shot migration: copies the curated docs corpus from the old Vite app
// (../docs/docs-content) into Nextra's content/ directory.
//
// - Replaces the {{TOKEN}} hostname placeholders with the docs.valyd.work
//   environment hosts (same values as ../docs/.env).
// - Strips the leading "> Source: ..." blockquote header (agent-corpus
//   metadata, not page content). Everything else is preserved verbatim.
// - Writes .md (not .mdx) so braces/angle brackets in prose are never parsed
//   as JSX expressions.
//
// Re-run after editing the source corpus: node scripts/migrate-content.mjs

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.resolve(ROOT, '..', 'docs', 'docs-content')

const TOKENS = {
  DOCS_BASE_URL: 'docs.valyd.work',
  VERIFY_BASE_URL: 'idp.valyd.work',
  IDP_BASE_URL: 'idp.valyd.work',
  DEV_PORTAL_URL: 'dev.valyd.work'
}

// old corpus file → new content path (null = handled elsewhere)
const MAP = {
  'docs/overview.md': 'content/docs/index.md',
  'docs/quick-start.md': 'content/docs/quick-start.md',
  'docs/create-project.md': 'content/docs/create-project.md',
  'docs/login-sessions.md': 'content/docs/login-sessions.md',
  'docs/authentication.md': 'content/docs/authentication.md',
  'docs/oidc.md': 'content/docs/oidc.md',
  'docs/endpoints.md': 'content/docs/endpoints.md',
  'docs/scopes.md': 'content/docs/scopes.md',
  'docs/request-data.md': 'content/docs/request-data.md',
  'docs/organizations.md': 'content/docs/organizations.md',
  'docs/errors.md': 'content/docs/errors.md',
  'docs/changelog.md': 'content/docs/changelog.md',
  'verify/intro.md': 'content/verifications/index.md',
  'verify/quickstart.md': 'content/verifications/quickstart.md',
  'verify/console.md': 'content/verifications/console.md',
  'verify/modes.md': 'content/verifications/modes.md',
  'verify/hosted.md': 'content/verifications/hosted.md',
  'verify/standalone.md': 'content/verifications/standalone.md',
  'verify/managed.md': 'content/verifications/managed.md',
  'verify/sdk.md': 'content/verifications/sdk.md',
  'verify/webhooks.md': 'content/verifications/webhooks.md',
  'verify/statuses.md': 'content/verifications/statuses.md',
  'verify/api-reference.md': 'content/verifications/api-reference.md'
}

const replaceTokens = text =>
  text.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => TOKENS[key] ?? m)

const stripSourceHeader = text => {
  const lines = text.split('\n')
  let i = 0
  while (i < lines.length && (lines[i].startsWith('> ') || lines[i].trim() === '')) i++
  // only strip if it actually was the "> Source:" header
  if (lines[0]?.startsWith('> Source:')) return lines.slice(i).join('\n')
  return text
}

let migrated = 0
for (const [src, dest] of Object.entries(MAP)) {
  const raw = await fs.readFile(path.join(SRC, src), 'utf8')
  const out = replaceTokens(stripSourceHeader(raw))
  const abs = path.join(ROOT, dest)
  await fs.mkdir(path.dirname(abs), { recursive: true })
  await fs.writeFile(abs, out)
  migrated++
}
console.log(`migrated ${migrated} corpus pages into content/`)

// Static agent corpus (served verbatim at /docs/*.md, /verify/*.md, /llms.txt …)
// mirrors what the old generator wrote into public/.
const STATIC = [
  ['llms.txt', 'public/llms.txt'],
  ['llms-full.txt', 'public/llms-full.txt'],
  ['robots.txt', 'public/robots.txt'],
  ['openapi/valyd-id.json', 'public/openapi/valyd-id.json'],
  ['openapi/valyd-verify.json', 'public/openapi/valyd-verify.json']
]
for (const dir of ['docs', 'verify']) {
  for (const f of await fs.readdir(path.join(SRC, dir))) {
    if (f.endsWith('.md')) STATIC.push([`${dir}/${f}`, `public/${dir}/${f}`])
  }
}
for (const [src, dest] of STATIC) {
  const raw = await fs.readFile(path.join(SRC, src), 'utf8')
  const abs = path.join(ROOT, dest)
  await fs.mkdir(path.dirname(abs), { recursive: true })
  await fs.writeFile(abs, replaceTokens(raw))
}
console.log(`wrote ${STATIC.length} static corpus files into public/`)
