#!/usr/bin/env node
// Contract gate: the published OpenAPI specs are a source of truth, not a
// scratchpad. If the contract agent left hedging placeholders behind
// ("inferred", "not confirmed", "schema not documented"), the human API
// reference, the SDK docs and llms.txt will silently disagree with the spec.
// Fail the build so a half-finished contract can never ship.
//
// Runs against public/openapi/*.json. Exits 1 (with file + line context) on
// any match, case-insensitive.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OPENAPI_DIR = path.join(ROOT, 'public', 'openapi')

// Hedging strings that must never survive into a published spec.
const FORBIDDEN = [
  /inferred/i,
  /not confirmed/i,
  /schema not documented/i,
]

let files = []
try {
  files = (await fs.readdir(OPENAPI_DIR))
    .filter((n) => n.endsWith('.json'))
    .sort()
} catch (err) {
  console.error(`check-openapi: cannot read ${path.relative(ROOT, OPENAPI_DIR)}: ${err.message}`)
  process.exit(1)
}

const failures = []
for (const name of files) {
  const rel = path.join('public', 'openapi', name)
  const body = await fs.readFile(path.join(OPENAPI_DIR, name), 'utf8')
  const lines = body.split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const pattern of FORBIDDEN) {
      const m = line.match(pattern)
      if (m) {
        failures.push(`${rel}:${i + 1}: forbidden "${m[0]}" — ${line.trim()}`)
      }
    }
  })
}

if (failures.length) {
  console.error('check-openapi: hedging placeholders found in published OpenAPI specs.')
  console.error('The contract agent left unconfirmed content behind — the spec must be authoritative.\n')
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`ok — checked ${files.length} OpenAPI spec(s); no unconfirmed/inferred placeholders`)
