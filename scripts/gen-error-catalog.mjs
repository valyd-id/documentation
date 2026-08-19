#!/usr/bin/env node
/**
 * gen-error-catalog.mjs — generates the complete error-code table in
 * content/docs/errors.md from the IdP backend source, so the docs can never
 * drift from what the API actually returns.
 *
 * Sources swept (read-only):
 *   1. GlobalHelper::apiError('code', 'message', status)  — login/OIDC/portal surface
 *   2. 'error' => 'code'  (Verify engine response bodies)  — verification surface
 *
 * Usage:  node scripts/gen-error-catalog.mjs [--idp /path/to/idp/backend]
 *
 * The table is written between the ERROR-CATALOG markers in
 * content/docs/errors.md. Run this after adding or changing backend error
 * codes, then rebuild the docs. If the IdP source tree is not present
 * (e.g. building on a machine without it), the existing table is left as-is.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ERRORS_MD = join(ROOT, 'content/docs/errors.md')
const idpArg = process.argv.indexOf('--idp')
const IDP = idpArg > -1 ? process.argv[idpArg + 1] : '/var/www/pollus_main_servers/idp/backend'
const APP = join(IDP, 'app')

if (!existsSync(APP)) {
  console.log(`[gen-error-catalog] IdP source not found at ${APP} — keeping existing table.`)
  process.exit(0)
}

/** Short human "fix" hints for the codes integrators hit most. Everything else
 * gets its representative server message, which is usually self-explanatory. */
const FIX = {
  invalid_client: 'Check client_id/client_secret and that the app is active in the Developer Portal.',
  invalid_token: 'Token missing/expired — refresh it or sign the user in again.',
  invalid_grant: 'Code/refresh token expired, already used, or issued to another client — restart the flow.',
  invalid_request: 'A required parameter is missing or malformed — compare against the reference.',
  invalid_scope: 'Enable the scope for your app in the Developer Portal before requesting it.',
  insufficient_scope: 'The access token lacks a required scope (openid is required for OIDC resource calls).',
  access_denied: 'The user declined, or the app is not permitted for this account.',
  rate_limited: 'Back off and retry after the window resets.',
  endpoint_removed: 'You are calling a removed legacy TPSSO endpoint — migrate to /api/auth/oidc/*.',
  insufficient_balance: 'Top up the project wallet in the console.',
  workflow_not_found: 'The workflow id does not belong to this project — copy it from the portal.',
  session_not_found: 'Wrong or expired session id.',
  state_mismatch: 'Callback state ≠ stored state — restart login; never skip this check.',
}

const files = []
;(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    const st = statSync(p)
    if (st.isDirectory()) walk(p)
    else if (p.endsWith('.php')) files.push(p)
  }
})(APP)

/** code -> { statuses:Set, message } */
const catalog = new Map()
const add = (code, status, message) => {
  if (!/^[a-z][a-z0-9_]+$/.test(code)) return
  const row = catalog.get(code) ?? { statuses: new Set(), message: '' }
  if (status) row.statuses.add(Number(status))
  if (message && (!row.message || message.length < row.message.length)) row.message = message
  catalog.set(code, row)
}

const RE_HELPER = /apiError\(\s*'([a-z0-9_]+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*(?:,\s*(\d{3}))?/g
const RE_VERIFY = /'error'\s*=>\s*'([a-z0-9_]+)'/g

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(RE_HELPER)) add(m[1], m[3] ?? 400, m[2].replace(/\\'/g, "'"))
  for (const m of src.matchAll(RE_VERIFY)) add(m[1], null, '')
}

const rows = [...catalog.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, r]) => {
  const statuses = [...r.statuses].sort((a, b) => a - b).join(', ') || '—'
  const hint = FIX[code] ?? r.message ?? ''
  // keep table cells single-line and tame
  const clean = (s) => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').slice(0, 140)
  return `| \`${code}\` | ${statuses} | ${clean(hint)} |`
})

const table = [
  '| Code | HTTP | Meaning / fix |',
  '| --- | --- | --- |',
  ...rows,
].join('\n')

const marker = /<!-- ERROR-CATALOG:START -->[\s\S]*<!-- ERROR-CATALOG:END -->/
const md = readFileSync(ERRORS_MD, 'utf8')
if (!marker.test(md)) {
  console.error('[gen-error-catalog] markers not found in errors.md — aborting.')
  process.exit(1)
}
writeFileSync(
  ERRORS_MD,
  md.replace(
    marker,
    `<!-- ERROR-CATALOG:START -->\n_Generated from the API source — ${rows.length} codes. Do not edit by hand; run \`node scripts/gen-error-catalog.mjs\`._\n\n${table}\n<!-- ERROR-CATALOG:END -->`
  )
)
console.log(`[gen-error-catalog] wrote ${rows.length} codes to errors.md`)
