// Remark plugin: rewrite the canonical *.valyd.work hosts in RENDERED pages to
// the per-environment hosts, so the HTML docs match the deploy (dev=.work,
// testing=.vip, prod=.id) — the same substitution scripts/gen-corpus.mjs does
// for the machine-readable corpus. Sources stay canonical (.work); env vars
// drive the output.
//
//   NEXT_PUBLIC_DOCS_URL  NEXT_PUBLIC_IDP_URL  NEXT_PUBLIC_DEV_URL

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
