#!/usr/bin/env node
// Internal link checker: collects every site-relative link in content/**/*.md(x)
// and app/**/*.tsx and verifies it resolves to a content page, an app route,
// a public/ file, or a configured redirect. Exits 1 on broken links.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function walk(dir) {
  const out = []
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(abs)))
    else out.push(abs)
  }
  return out
}

// --- Build the set of valid routes -----------------------------------------
const routes = new Set(['/'])

for (const f of await walk(path.join(ROOT, 'content'))) {
  const rel = path.relative(path.join(ROOT, 'content'), f)
  if (!/\.(md|mdx)$/.test(rel)) continue
  let r = '/' + rel.replace(/\.(md|mdx)$/, '')
  r = r.replace(/\/index$/, '') || '/'
  routes.add(r)
}
routes.add('/sandbox') // app route
for (const f of await walk(path.join(ROOT, 'public'))) {
  routes.add('/' + path.relative(path.join(ROOT, 'public'), f))
}
routes.add('/sitemap.xml')

// redirect sources from next.config.mjs are also valid targets
const nextConfig = await import(path.join(ROOT, 'next.config.mjs'))
for (const r of await nextConfig.default.redirects()) routes.add(r.source)

// --- Collect links ----------------------------------------------------------
const files = [
  ...(await walk(path.join(ROOT, 'content'))),
  ...(await walk(path.join(ROOT, 'app')))
].filter(f => /\.(md|mdx|tsx|ts)$/.test(f))

const broken = []
for (const f of files) {
  let text = await fs.readFile(f, 'utf8')
  // code samples aren't site links — strip fenced blocks and template-literal
  // snippet constants before scanning
  if (/\.(md|mdx)$/.test(f)) text = text.replace(/^```[\s\S]*?^```/gm, '')
  else text = text.replace(/`[\s\S]*?`/g, '')
  const links = [
    // markdown links [x](/path) and href="/path"
    ...[...text.matchAll(/\]\((\/[^)#?\s]*)?(?:[#?][^)\s]*)?\)/g)].map(m => m[1]),
    ...[...text.matchAll(/href=["'](\/[^"'#?]*)/g)].map(m => m[1])
  ].filter(Boolean)
  for (const link of links) {
    const clean = link.replace(/\/$/, '') || '/'
    if (clean.startsWith('/_pagefind')) continue
    if (!routes.has(clean)) {
      broken.push(`${path.relative(ROOT, f)} → ${link}`)
    }
  }
}

if (broken.length) {
  console.error(`BROKEN INTERNAL LINKS (${broken.length}):`)
  for (const b of broken) console.error('  ' + b)
  process.exit(1)
}
console.log(`ok — checked ${files.length} files, all internal links resolve`)
