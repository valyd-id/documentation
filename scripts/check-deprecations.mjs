#!/usr/bin/env node
// Contract gate: content must never RECOMMEND a deprecated field as the value
// to read. The canonical list of deprecated fields is content/docs/deprecations.md
// (the single source of truth); this script parses it, then fails the build if
// any other content page steers a reader toward the deprecated field instead of
// its replacement — e.g. tells them to read `bands.*.verified` rather than
// `satisfied`.
//
// It flags a recommending verb (read/use/check/prefer/rely on/…) placed
// directly in front of a deprecated field token. Merely MENTIONING the field to
// explain it is deprecated is fine — that is how honest docs describe an alias.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEPRECATIONS = path.join(ROOT, 'content', 'docs', 'deprecations.md')

// deprecations.md is the source list itself; it names the deprecated fields on
// purpose (and its own prose "Age check `bands.*.verified` response field"
// would otherwise trip the verb heuristic). errors.md/changelog legitimately
// narrate removals too.
const EXEMPT = new Set([
  'content/docs/deprecations.md',
  'content/docs/errors.md',
  'content/docs/changelog.md',
])

// Verbs that turn a field mention into a recommendation to READ that field.
const VERBS = ['read', 'use', 'check', 'prefer', 'rely on', 'return', 'parse', 'inspect', 'reference', 'look at', 'consume']

function fieldToRegexSource(field) {
  // Escape regex metachars, then let `*` (a path wildcard) match any key segment
  // AND the literal `*` that docs often write.
  return field
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[A-Za-z0-9_*]+')
}

// --- Parse the deprecated-field list from deprecations.md -------------------
let dep = ''
try {
  dep = await fs.readFile(DEPRECATIONS, 'utf8')
} catch (err) {
  console.error(`check-deprecations: cannot read content/docs/deprecations.md: ${err.message}`)
  process.exit(1)
}

const deprecated = [] // { field, replacement }
for (const raw of dep.split(/\r?\n/)) {
  const line = raw.trim()
  if (!line.startsWith('|')) continue
  if (/^\|[\s|:-]+\|?$/.test(line)) continue // separator row
  const cols = line.split('|').slice(1, -1).map((c) => c.trim())
  if (cols.length < 4) continue
  const [what, status, , useInstead] = cols
  if (!/deprecat/i.test(status)) continue
  // Deprecated field tokens = backtick spans in the "What" column that look
  // like a dotted field path.
  const fields = [...what.matchAll(/`([^`]+)`/g)]
    .map((m) => m[1])
    .filter((t) => /[A-Za-z_]\w*\.[A-Za-z_*]/.test(t))
  const replacement = (useInstead.match(/`([^`]+)`/) || [])[1] || null
  for (const field of fields) deprecated.push({ field, replacement })
}

if (deprecated.length === 0) {
  console.log('ok — no deprecated fields declared in deprecations.md; nothing to enforce')
  process.exit(0)
}

// Build one matcher per deprecated field: a recommending verb, then optional
// backtick/quote, then the field.
const verbAlt = VERBS.map((v) => v.replace(/\s+/g, '\\s+')).join('|')
const matchers = deprecated.map(({ field, replacement }) => ({
  field,
  replacement,
  re: new RegExp(`\\b(?:${verbAlt})\\b[\\s:]*[\`'"]?(${fieldToRegexSource(field)})`, 'i'),
}))

// --- Walk content ----------------------------------------------------------
async function walk(dir) {
  const out = []
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(abs)))
    else if (/\.(md|mdx)$/.test(e.name)) out.push(abs)
  }
  return out
}

const failures = []
for (const abs of await walk(path.join(ROOT, 'content'))) {
  const rel = path.relative(ROOT, abs)
  if (EXEMPT.has(rel)) continue
  const body = await fs.readFile(abs, 'utf8')
  const lines = body.split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const { field, replacement, re } of matchers) {
      if (re.test(line)) {
        const useInstead = replacement ? ` — recommend \`${replacement}\` instead` : ''
        failures.push(`${rel}:${i + 1}: recommends deprecated field \`${field}\`${useInstead}\n    ${line.trim()}`)
      }
    }
  })
}

if (failures.length) {
  console.error('check-deprecations: content recommends a deprecated field as the value to read.')
  console.error('Deprecated fields must be documented as aliases, never recommended.\n')
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`ok — no content page recommends a deprecated field (${deprecated.length} tracked: ${deprecated.map((d) => d.field).join(', ')})`)
