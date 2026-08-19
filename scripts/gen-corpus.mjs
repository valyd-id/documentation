#!/usr/bin/env node
// Build-time generator for the machine-readable / AI-agent corpus.
//
// Source of truth (canonical, committed, using the *.valyd.work default hosts):
//   - content/docs/*.md, content/verifications/*.md   (the rendered pages)
//   - corpus/llms.txt, corpus/llms-full.txt, corpus/robots.txt
//   - corpus/openapi/*.json
//
// This script writes the env-substituted copies that agents actually fetch:
//   - public/docs/*.md      (+ overview.md alias for index)
//   - public/verify/*.md    (+ intro.md alias for index)
//   - public/llms.txt, public/llms-full.txt, public/robots.txt
//   - public/openapi/*.json
//
// Hosts come from env so the SAME sources deploy to every environment:
//   NEXT_PUBLIC_DOCS_URL   docs site        (default https://docs.valyd.work)
//   NEXT_PUBLIC_IDP_URL    API host (idp)   (default https://idp.valyd.work)
//   NEXT_PUBLIC_DEV_URL    developer portal (default https://dev.valyd.work)
//
// Environments: dev = *.valyd.work, testing = *.valyd.vip, prod = *.valyd.id.
// Set the three vars for the target env before `next build` (prebuild runs this).
//
// Run standalone: node scripts/gen-corpus.mjs

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Load NEXT_PUBLIC_* from .env / .env.local so a standalone run (and the
// `prebuild` hook) sees the same hosts Next.js does. Real env vars win.
for (const file of ['.env', '.env.local']) {
  try {
    const txt = await fs.readFile(path.join(ROOT, file), 'utf8')
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*(NEXT_PUBLIC_[A-Z_]+)\s*=\s*(.*)\s*$/)
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    /* no such env file — fine, defaults apply */
  }
}

// Canonical hosts baked into the sources; each maps to an env override.
const HOSTS = [
  { canonical: 'docs.valyd.work', url: process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.valyd.work' },
  { canonical: 'idp.valyd.work', url: process.env.NEXT_PUBLIC_IDP_URL || 'https://idp.valyd.work' },
  { canonical: 'dev.valyd.work', url: process.env.NEXT_PUBLIC_DEV_URL || 'https://dev.valyd.work' }
]

const hostOf = url => url.replace(/^https?:\/\//, '').replace(/\/+$/, '')

// Replace both the full `https://<canonical>` form and the bare `<canonical>`
// host. Full form first so the scheme is rewritten too (env may use http in dev).
function substitute(text) {
  let out = text
  for (const { canonical, url } of HOSTS) {
    out = out.split(`https://${canonical}`).join(url.replace(/\/+$/, ''))
    out = out.split(canonical).join(hostOf(url))
  }
  return out
}

async function writeSub(srcAbs, destAbs) {
  const raw = await fs.readFile(srcAbs, 'utf8')
  await fs.mkdir(path.dirname(destAbs), { recursive: true })
  await fs.writeFile(destAbs, substitute(raw))
}

// Recursive .md listing (relative paths, posix separators) — sub-folder pages
// (e.g. verifications/standalone/*) are part of the corpus too.
async function listMd(dirAbs, prefix = '') {
  const out = []
  for (const e of await fs.readdir(dirAbs, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...(await listMd(path.join(dirAbs, e.name), `${prefix}${e.name}/`)))
    else if (e.name.endsWith('.md')) out.push(prefix + e.name)
  }
  return out
}

// A folder index page also mirrors to `<folder>.md` so the flat historical URL
// (e.g. /verify/standalone.md) keeps working after a page splits into a folder.
const folderAlias = f => (f.endsWith('/index.md') ? f.replace(/\/index\.md$/, '.md') : null)

async function mdMirror(srcDir, destDir, indexAlias) {
  const files = await listMd(path.join(ROOT, srcDir))
  const expected = new Set([
    ...files,
    ...files.map(folderAlias).filter(Boolean),
    ...(indexAlias ? [indexAlias] : [])
  ])
  try {
    for (const existing of await listMd(path.join(ROOT, destDir))) {
      if (!expected.has(existing)) {
        await fs.unlink(path.join(ROOT, destDir, existing))
      }
    }
  } catch {
    // Destination is created by writeSub below on a clean checkout.
  }
  for (const f of files) {
    await writeSub(path.join(ROOT, srcDir, f), path.join(ROOT, destDir, f))
    // Preserve the historical .md URL for the index page (overview.md / intro.md)
    if (f === 'index.md' && indexAlias) {
      await writeSub(path.join(ROOT, srcDir, f), path.join(ROOT, destDir, indexAlias))
    }
    const alias = folderAlias(f)
    if (alias) await writeSub(path.join(ROOT, srcDir, f), path.join(ROOT, destDir, alias))
  }
  return files.length
}

const hosts = HOSTS.map(h => `${h.canonical} → ${h.url}`).join(', ')
console.log(`[gen-corpus] hosts: ${hosts}`)

// 1) Rendered pages → agent-fetchable .md mirrors (regenerated from content/, so they never drift).
const nDocs = await mdMirror('content/docs', 'public/docs', 'overview.md')
const nVerify = await mdMirror('content/verifications', 'public/verify', 'intro.md')

// 2) llms.txt (curated index) + robots.txt → env-substituted copies.
for (const f of ['llms.txt', 'robots.txt']) {
  await writeSub(path.join(ROOT, 'corpus', f), path.join(ROOT, 'public', f))
}
for (const f of await fs.readdir(path.join(ROOT, 'corpus', 'openapi'))) {
  if (f.endsWith('.json')) {
    await writeSub(path.join(ROOT, 'corpus', 'openapi', f), path.join(ROOT, 'public', 'openapi', f))
  }
}

// 3) llms-full.txt — BUILT from every content page (not a static file), so it can
//    never drift: add a page under content/ and it appears here automatically.
const DOCS_URL = HOSTS[0].url
const SEP = '='.repeat(80)

// Read a content section in nav-ish order (index first, then alphabetical).
async function section(srcDir, urlPrefix, indexAlias) {
  const files = (await listMd(path.join(ROOT, srcDir)))
    .sort((a, b) => (a === 'index.md' ? -1 : b === 'index.md' ? 1 : a.localeCompare(b)))
  const blocks = []
  for (const f of files) {
    // Folder index pages surface under their flat alias URL (…/standalone.md).
    const name =
      f === 'index.md' ? indexAlias
      : f.endsWith('/index.md') ? f.replace(/\/index\.md$/, '')
      : f.replace(/\.md$/, '')
    const url = `${DOCS_URL}/${urlPrefix}/${name}.md`
    const body = substitute(await fs.readFile(path.join(ROOT, srcDir, f), 'utf8')).trim()
    blocks.push(`${SEP}\n=== FILE: ${url} ===\n${SEP}\n\n> Source: ${url.replace(/\.md$/, '')}\n\n${body}\n`)
  }
  return blocks
}

const indexBody = substitute(await fs.readFile(path.join(ROOT, 'corpus', 'llms.txt'), 'utf8')).trim()
const header =
  `# Valyd — Full Documentation (single-file corpus for AI agents)\n\n` +
  `This file concatenates every Valyd documentation page. Each page is delimited by a\n` +
  `'=== FILE: <url> ===' marker. The index below (from llms.txt) lists all pages.\n\n` +
  `${SEP}\n=== INDEX (llms.txt) ===\n${SEP}\n\n${indexBody}\n`

const docBlocks = await section('content/docs', 'docs', 'overview')
const verifyBlocks = await section('content/verifications', 'verify', 'intro')
const fullText = [header, ...docBlocks, ...verifyBlocks].join('\n')
await fs.writeFile(path.join(ROOT, 'public', 'llms-full.txt'), fullText)

console.log(`[gen-corpus] wrote ${nDocs} docs + ${nVerify} verify mirrors, llms.txt, robots.txt, OpenAPI specs`)
console.log(`[gen-corpus] built llms-full.txt from ${docBlocks.length + verifyBlocks.length} pages`)
