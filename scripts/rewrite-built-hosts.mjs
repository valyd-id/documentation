#!/usr/bin/env node
// Postbuild: rewrite canonical *.valyd.work hosts in the BUILT server output to
// this env's hosts (dev=.work, testing=.vip, prod=.id).
//
// The remark-hosts plugin rewrites the rendered MDX AST, and gen-corpus rewrites
// the machine-readable corpus — but Nextra also embeds a RAW markdown copy of each
// page in the server output (for the copy-page / ask-AI chat feature) that neither
// touches. That raw copy keeps .work and trips check-hosts on vip/id builds. This
// does the same host substitution over the built files so every copy is consistent.
//
// Runs before check-hosts in the `postbuild` chain. No-op on a .work build.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Same .env loader gen-corpus / remark-hosts use.
for (const file of ['.env', '.env.local']) {
  try {
    const txt = await fs.readFile(path.join(ROOT, file), 'utf8')
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*(NEXT_PUBLIC_[A-Z_]+)\s*=\s*(.*)\s*$/)
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* no env file — defaults apply */ }
}

const HOSTS = [
  { canonical: 'docs.valyd.work', url: process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.valyd.work' },
  { canonical: 'idp.valyd.work', url: process.env.NEXT_PUBLIC_IDP_URL || 'https://idp.valyd.work' },
  { canonical: 'dev.valyd.work', url: process.env.NEXT_PUBLIC_DEV_URL || 'https://dev.valyd.work' }
].map(h => ({ ...h, host: h.url.replace(/^https?:\/\//, '').replace(/\/+$/, '') }))

const NEEDS_SUB = HOSTS.some(h => h.host !== h.canonical)
if (!NEEDS_SUB) {
  console.log('[rewrite-built-hosts] .work build — nothing to rewrite.')
  process.exit(0)
}

function sub(value) {
  let out = value
  for (const h of HOSTS) out = out.split(h.canonical).join(h.host)
  return out
}

async function* walk(dir) {
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}

const TARGET = path.join(ROOT, '.next/server/app')
let changed = 0
for await (const file of walk(TARGET)) {
  if (!/\.(html|js|rsc|txt|json)$/.test(file)) continue
  const txt = await fs.readFile(file, 'utf8')
  if (!txt.includes('valyd.work')) continue
  const out = sub(txt)
  if (out !== txt) { await fs.writeFile(file, out); changed++ }
}
console.log(`[rewrite-built-hosts] rewrote hosts in ${changed} built file(s) → ${HOSTS[0].host.replace('docs.valyd.', '*.valyd.')}`)
