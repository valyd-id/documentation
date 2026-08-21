#!/usr/bin/env node
// Gate: internal authoring placeholders must never reach a published page (the second audit found
// ~70 `[owner: confirm — …]` annotations live on enterprise pages). `[owner: confirm` and
// YOUR_VALUE_HERE are forbidden everywhere; TODO/FIXME/TBD are forbidden only OUTSIDE code fences
// (they can be literal words in a sample). `example.com` is intentionally NOT forbidden — it is a
// legitimate placeholder domain in code samples across the docs. A line may opt out with a trailing
// `<!-- placeholder-ok -->`. Scans authored content AND generated public output so a placeholder
// can't slip through either path. The owner's real to-do list lives in OWNER-FACTS.md at the repo
// root — outside every scanned tree — so it is never published and never trips this gate.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const ALWAYS = [/\[owner: confirm/i, /YOUR_VALUE_HERE/]
const CODE_ONLY = [/\bTODO\b/, /\bFIXME\b/, /\bTBD\b/]
const ALLOW = /placeholder-ok/

const TARGETS = [
  { dir: 'content', exts: new Set(['.md', '.mdx']) },
  { dir: path.join('public', 'docs'), exts: new Set(['.md']) },
  { dir: path.join('public', 'verify'), exts: new Set(['.md']) },
]
const EXTRA = ['public/llms.txt', 'public/llms-full.txt']

async function walk(dir, exts, out) {
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walk(p, exts, out)
    else if (exts.has(path.extname(e.name))) out.push(p)
  }
}

const files = []
for (const t of TARGETS) await walk(path.join(ROOT, t.dir), t.exts, files)
for (const f of EXTRA) { const abs = path.join(ROOT, f); try { await fs.access(abs); files.push(abs) } catch { /* not built yet */ } }

const failures = []
for (const abs of files) {
  const rel = path.relative(ROOT, abs)
  const lines = (await fs.readFile(abs, 'utf8')).split(/\r?\n/)
  let inFence = false
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return }
    if (ALLOW.test(line)) return
    for (const re of ALWAYS) { const m = line.match(re); if (m) failures.push(`${rel}:${i + 1}: forbidden "${m[0]}" — ${line.trim().slice(0, 120)}`) }
    if (!inFence) for (const re of CODE_ONLY) { const m = line.match(re); if (m) failures.push(`${rel}:${i + 1}: forbidden "${m[0]}" — ${line.trim().slice(0, 120)}`) }
  })
}

if (failures.length) {
  console.error('check-public-placeholders: internal placeholders found in published/generated docs.')
  console.error('Replace with an honest public statement; keep unconfirmed facts in OWNER-FACTS.md.\n')
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`ok — checked ${files.length} files; no [owner: confirm]/TODO/FIXME/TBD/YOUR_VALUE_HERE placeholders`)
