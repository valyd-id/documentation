#!/usr/bin/env node
// Gate: every "current version" reference to @valyd/sdk must equal the one published version.
// This closes the gap the second audit found — sync-sdk-version.mjs only auto-heals the caret
// install form, so a hand-typed "expected output" or heading could drift (docs said ^1.10.3 while
// an example said ^1.10.2). Feature-since markers (`v1.10.2+`, `1.10.1 or newer`, `sdk_min_version:`)
// legitimately name older versions and are ignored; changelog.md is history and is skipped.
// Resolves the canonical version the same way as sync-sdk-version.mjs so gate and stamper agree.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FALLBACK = '1.10.5'

function resolveVersion() {
  if (process.env.SDK_VERSION && /^\d+\.\d+\.\d+$/.test(process.env.SDK_VERSION)) return process.env.SDK_VERSION
  try {
    const v = JSON.parse(fs.readFileSync(path.resolve(ROOT, '..', 'valyd-sdk-js', 'package.json'), 'utf8')).version
    if (/^\d+\.\d+\.\d+$/.test(v)) return v
  } catch { /* not co-located (CI) */ }
  return FALLBACK
}

const VERSION = resolveVersion()
const DIRS = ['content', 'corpus']
const EXT = new Set(['.md', '.mdx', '.txt'])

// "current version" reference forms — the captured version must equal VERSION.
const FORMS = [
  /@valyd\/sdk@\^?(\d+\.\d+\.\d+)/g,   // install command + npm-ls output (caret or bare)
  /@valyd\/sdk (\d+\.\d+\.\d+)\)/g,     // "(@valyd/sdk X.Y.Z)" heading form
]
// bare backtick caret pin — only meaningful on a line that names the SDK
const BARE_CARET = /`\^(\d+\.\d+\.\d+)`/g

const failures = []
function scan(p) {
  if (path.basename(p) === 'changelog.md') return // release history, not current-version refs
  const rel = path.relative(ROOT, p)
  fs.readFileSync(p, 'utf8').split(/\r?\n/).forEach((line, i) => {
    for (const re of FORMS) {
      re.lastIndex = 0
      let m
      while ((m = re.exec(line))) {
        if (m[1] !== VERSION) failures.push(`${rel}:${i + 1}: @valyd/sdk ${m[1]} ≠ ${VERSION} — ${line.trim().slice(0, 120)}`)
      }
    }
    if (line.includes('@valyd/sdk')) {
      BARE_CARET.lastIndex = 0
      let m
      while ((m = BARE_CARET.exec(line))) {
        if (m[1] !== VERSION) failures.push(`${rel}:${i + 1}: \`^${m[1]}\` ≠ ^${VERSION} — ${line.trim().slice(0, 120)}`)
      }
    }
  })
}
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (EXT.has(path.extname(e.name))) scan(p)
  }
}
for (const d of DIRS) { const abs = path.join(ROOT, d); if (fs.existsSync(abs)) walk(abs) }

if (failures.length) {
  console.error(`check-sdk-version: stale @valyd/sdk current-version reference(s) — canonical is ${VERSION}.\n`)
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`ok — @valyd/sdk current-version references all at ${VERSION}`)
