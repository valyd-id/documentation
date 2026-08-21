#!/usr/bin/env node
// Consistency gate for the single-source IA (owner chose a gate over a generator). Validates the
// nav manifest (docs-manifest.mjs) against reality and the machine-readable layer — DIRECTIONAL
// checks, not structural equality (the reviewer's point: nav entries and capability IDs are not 1:1):
//   1. manifest → pages   : every sidebar item route resolves to a real content page.
//   2. stubs → pages       : every declared stub/alias route still exists (so old URLs 200).
//   3. capability → canonical : every capabilities.json `doc` resolves to a real generated page.
// Keeps the hand-authored _meta.tsx, llms.txt, sitemap and capability manifest from silently
// disagreeing about which pages exist.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SECTIONS, STUBS } from '../docs-manifest.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

// Resolve a site route to an authored content file (try page.md/.mdx and folder index).
function contentFile(route) {
  const rel = route.replace(/^\//, '')
  const bases = [
    path.join(ROOT, 'content', rel),
    path.join(ROOT, 'content', rel, 'index'),
  ]
  for (const b of bases) for (const ext of ['.md', '.mdx']) if (fs.existsSync(b + ext)) return b + ext
  // a bare "/docs" maps to content/docs/index.*
  return null
}

// 1. manifest items → content page exists
for (const s of SECTIONS) {
  for (const it of s.items) {
    if (it.home === 'ext') continue // /sandbox is an app route, not content
    if (!contentFile(it.route)) failures.push(`manifest: "${s.label} › ${it.title}" route ${it.route} has no content page`)
  }
}

// 2. stubs → content page exists (old URLs must still resolve)
for (const st of STUBS) {
  if (!contentFile(st.route)) failures.push(`stub: ${st.route} declared but no content page (old links would 404)`)
}

// 3. capability manifest → canonical page exists (in the generated corpus)
const capPath = path.join(ROOT, 'public', 'agent', 'capabilities.json')
if (fs.existsSync(capPath)) {
  let caps
  try { caps = JSON.parse(fs.readFileSync(capPath, 'utf8')) } catch (e) { failures.push(`capabilities.json: invalid JSON — ${e.message}`) }
  const publicHas = (doc) => {
    const rel = doc.replace(/^\//, '')
    return fs.existsSync(path.join(ROOT, 'public', rel)) ||
      fs.existsSync(path.join(ROOT, 'public', rel.replace(/\.md$/, '') + '.md'))
  }
  for (const c of caps?.capabilities || []) {
    if (c.doc && !publicHas(c.doc)) failures.push(`capabilities.json: "${c.goal || c.id || c.path}" doc ${c.doc} does not resolve to a generated page`)
  }
} else {
  console.log('note — capabilities.json not built; skipped capability→canonical check')
}

if (failures.length) {
  console.error('check-nav-consistency: the nav manifest / capability layer references pages that do not exist.\n')
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`ok — ${SECTIONS.reduce((n, s) => n + s.items.length, 0)} nav items + ${STUBS.length} stubs resolve; capability docs resolve`)
