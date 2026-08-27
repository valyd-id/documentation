// Stamp the current @valyd/sdk version across the docs from a SINGLE source of truth,
// so a published SDK release flows into every install command / pin automatically.
//
// Source of truth (first that resolves):
//   1. process.env.SDK_VERSION            (explicit override, e.g. in CI)
//   2. the sibling SDK package.json       (../valyd-sdk-js/package.json — always the real version)
//   3. a pinned fallback below            (so the build never breaks off-box)
//
// Runs in `prebuild` — every `npm run build` re-stamps. Idempotent.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FALLBACK = '1.10.5'

function resolveVersion() {
  if (process.env.SDK_VERSION && /^\d+\.\d+\.\d+$/.test(process.env.SDK_VERSION)) return process.env.SDK_VERSION
  const sibling = path.resolve(ROOT, '..', 'valyd-sdk-js', 'package.json')
  try {
    const v = JSON.parse(fs.readFileSync(sibling, 'utf8')).version
    if (/^\d+\.\d+\.\d+$/.test(v)) return v
  } catch { /* not co-located (CI) — fall through */ }
  return FALLBACK
}

const VERSION = resolveVersion()
const DIRS = ['content', 'lib', 'corpus']
const EXT = new Set(['.md', '.mdx', '.ts', '.tsx', '.txt', '.mjs'])
const RE = /@valyd\/sdk@\^\d+\.\d+\.\d+/g
const TARGET = `@valyd/sdk@^${VERSION}`

let changed = 0
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { walk(p); continue }
    if (!EXT.has(path.extname(e.name))) continue
    const src = fs.readFileSync(p, 'utf8')
    // The caret-install form is the primary token; also heal the other "current version"
    // shapes the reviewer flagged (npm-ls output, a `(@valyd/sdk X.Y.Z)` heading, and bare
    // backtick caret pins). changelog.md is HISTORY — never rewrite its version numbers.
    // Feature-since markers (`v1.10.2+`, `1.10.1+`, `sdk_min_version:`) don't match any of
    // these patterns, so they're left untouched.
    const isChangelog = path.basename(p) === 'changelog.md'
    let out = src.replace(RE, TARGET)
    if (!isChangelog) {
      out = out
        .replace(/`@valyd\/sdk@\d+\.\d+\.\d+`/g, `\`@valyd/sdk@${VERSION}\``)
        .replace(/@valyd\/sdk (\d+\.\d+\.\d+)\)/g, `@valyd/sdk ${VERSION})`)
      // bare backtick caret pins, only on lines that already name the SDK (so a `^X.Y.Z`
      // for some other dependency is never touched)
      out = out
        .split('\n')
        .map((line) => (line.includes('@valyd/sdk') ? line.replace(/`\^\d+\.\d+\.\d+`/g, `\`^${VERSION}\``) : line))
        .join('\n')
    }
    if (out !== src) { fs.writeFileSync(p, out); changed++ }
  }
}
for (const d of DIRS) { const abs = path.join(ROOT, d); if (fs.existsSync(abs)) walk(abs) }

// Keep the product-boundary gate's required pins in step too.
const gate = path.join(ROOT, 'scripts', 'check-product-boundaries.mjs')
try {
  let g = fs.readFileSync(gate, 'utf8').replace(/@valyd\/sdk@\^\d+\.\d+\.\d+/g, TARGET)
  // Keep the forbidden-install lookahead `(?!@\^X.Y.Z)` in step too.
  g = g.replace(/\(\?!@\\\^\d+\\\.\d+\\\.\d+\)/g, `(?!@\\^${VERSION.replace(/\./g, '\\.')})`)
  fs.writeFileSync(gate, g)
} catch { /* ignore */ }

console.log(`[sync-sdk-version] stamped ${TARGET} (${changed} file${changed === 1 ? '' : 's'} updated)`) 
