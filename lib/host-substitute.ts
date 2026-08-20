import { SITE } from './site'

/**
 * Build-time host swap for embedded RAW strings — specifically each page's
 * `sourceCode` (the verbatim source shown by copy-page / Ask-AI).
 *
 * WHY THIS EXISTS (and why the old postbuild byte-hack was removed):
 * The rendered MDX is already host-corrected by remark-hosts. But the raw
 * `sourceCode` is embedded into the React Server Components (Flight) payload as a
 * BYTE-LENGTH-PREFIXED string row. The previous approach —
 * scripts/rewrite-built-hosts.mjs doing a blind find-and-replace of *.valyd.work
 * over the compiled .rsc/.html — changes the string's length WITHOUT updating that
 * prefix, desyncing the client's Flight parser → "Uncaught Error: Connection
 * closed." → the whole page crashes. Doc pages contain host strings (idp API
 * examples) so they all broke; the home page has none, so it survived. On the dev
 * (.work) env the swap was a no-op, which is why only .vip/.id broke.
 *
 * Doing the substitution HERE, at render time, lets React encode the correct
 * length prefix for the (already-swapped) string. The postbuild script must then
 * NOT touch .rsc/.html (see scripts/rewrite-built-hosts.mjs).
 *
 * Canonical hosts are *.valyd.work; map each to this env's host from lib/site.
 * We replace the BARE host so both `https://idp.valyd.work/...` and a bare
 * `idp.valyd.work` are handled, and the protocol is never doubled.
 */
const bareHost = (u: string) => u.replace(/^https?:\/\//, '')

const MAP: Array<[RegExp, string]> = [
  [/docs\.valyd\.work/g, bareHost(SITE.docsUrl)],
  [/idp\.valyd\.work/g, bareHost(SITE.idpUrl)],
  [/dev\.valyd\.work/g, bareHost(SITE.devUrl)],
]

export function substituteHosts(value: string): string {
  if (!value || !value.includes('valyd.work')) return value
  let out = value
  for (const [re, host] of MAP) out = out.replace(re, host)
  return out
}
