// Remark plugin: rewrite the canonical *.valyd.work hosts in RENDERED pages to
// the per-environment hosts, so the HTML docs match the deploy (dev=.work,
// testing=.vip, prod=.id) — the same substitution scripts/gen-corpus.mjs does
// for the machine-readable corpus. Sources stay canonical (.work); env vars
// drive the output.
//
//   NEXT_PUBLIC_DOCS_URL  NEXT_PUBLIC_IDP_URL  NEXT_PUBLIC_DEV_URL

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Load NEXT_PUBLIC_* from .env / .env.local the SAME way scripts/gen-corpus.mjs does.
// next.config imports this plugin before Next.js has populated process.env from .env,
// so without this the hosts default to *.work and no substitution happens on vip/id
// builds — the pages keep .work and the check-hosts gate fails. Real env vars win.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const file of ['.env', '.env.local']) {
  try {
    const txt = readFileSync(path.join(ROOT, file), 'utf8')
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

const HOSTS = [
  { canonical: 'docs.valyd.work', url: process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.valyd.work' },
  { canonical: 'idp.valyd.work', url: process.env.NEXT_PUBLIC_IDP_URL || 'https://idp.valyd.work' },
  { canonical: 'dev.valyd.work', url: process.env.NEXT_PUBLIC_DEV_URL || 'https://dev.valyd.work' }
].map(h => ({ ...h, host: h.url.replace(/^https?:\/\//, '').replace(/\/+$/, ''), full: h.url.replace(/\/+$/, '') }))

// Skip work entirely when nothing is overridden (fast path for dev).
const NEEDS_SUB = HOSTS.some(h => h.host !== h.canonical)

function sub(value) {
  let out = value
  for (const h of HOSTS) {
    out = out.split(`https://${h.canonical}`).join(h.full)
    out = out.split(h.canonical).join(h.host)
  }
  return out
}

function walk(node) {
  if (!node || typeof node !== 'object') return
  if (typeof node.value === 'string' && node.value.includes('valyd.work')) {
    node.value = sub(node.value)
  }
  if (typeof node.url === 'string' && node.url.includes('valyd.work')) {
    node.url = sub(node.url)
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child)
  }
}

export default function remarkHosts() {
  return tree => {
    if (NEEDS_SUB) walk(tree)
  }
}
