#!/usr/bin/env node
/**
 * gen-error-catalog.mjs — generates the complete error-code table in
 * content/docs/errors.md from the IdP backend source, so the docs can never
 * drift from what the API actually returns.
 *
 * Sources swept (read-only):
 *   1. GlobalHelper::apiError('code', 'message', status)  — login/portal surface (envelope)
 *   2. 'error' => 'code'  (Verify engine response bodies)  — verification surface
 *   3. OAuthError::json / ::bearer / ::invalidClient / ::redirect(Url) and the authorize
 *      `$fail('code', ...)` closure — OIDC protocol endpoints (RFC 6749/6750 bodies and
 *      error redirects; redirect-only codes are listed with HTTP "redirect")
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
  access_denied: 'The user declined, or the app is not permitted for this account (OIDC: sent to your redirect_uri as ?error=access_denied).',
  login_required: 'prompt=none (or id_token_hint) could not be satisfied silently — redirect again without prompt=none.',
  consent_required: 'prompt=none but this app has no prior grant for these scopes — redirect again without prompt=none.',
  request_not_supported: 'The request (JWT request object) parameter is not supported — send plain query/form parameters.',
  request_uri_not_supported: 'The request_uri parameter is not supported — send plain query/form parameters.',
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
  if (status) row.statuses.add(/^\d+$/.test(String(status)) ? Number(status) : String(status))
  if (message && (!row.message || message.length < row.message.length)) row.message = message
  catalog.set(code, row)
}

const RE_HELPER = /apiError\(\s*'([a-z0-9_]+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*(?:,\s*(\d{3}))?/g
const RE_VERIFY = /'error'\s*=>\s*'([a-z0-9_]+)'/g
// OIDC protocol errors (App\Support\OAuthError) — RFC 6749 §5.2 / RFC 6750 / RFC 7591 bodies.
const RE_OAUTH_JSON = /OAuthError::(?:json|bearer)\(\s*'([a-z0-9_]+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*(?:,\s*(\d{3}))?/g
const RE_OAUTH_CLIENT = /OAuthError::invalidClient\(\s*'((?:[^'\\]|\\.)*)'/g
// Authorization-endpoint errors delivered to the client's redirect_uri (?error=...).
const RE_OAUTH_REDIRECT = /(?:OAuthError::redirect(?:Url)?\([^,]+,\s*|\$fail\(\s*)'([a-z0-9_]+)'\s*,\s*'((?:[^'\\]|\\.)*)'/g

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(RE_HELPER)) add(m[1], m[3] ?? 400, m[2].replace(/\\'/g, "'"))
  for (const m of src.matchAll(RE_VERIFY)) add(m[1], null, '')
  for (const m of src.matchAll(RE_OAUTH_JSON)) add(m[1], m[3] ?? 400, m[2].replace(/\\'/g, "'"))
  for (const m of src.matchAll(RE_OAUTH_CLIENT)) add('invalid_client', 401, m[1])
  for (const m of src.matchAll(RE_OAUTH_REDIRECT)) add(m[1], 'redirect', m[2].replace(/\\'/g, "'"))
}

const rows = [...catalog.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, r]) => {
  const statuses = [...r.statuses]
    .sort((a, b) => (typeof a === typeof b ? (typeof a === 'number' ? a - b : String(a).localeCompare(String(b))) : typeof a === 'number' ? -1 : 1))
    .join(', ') || '—'
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
