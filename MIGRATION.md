# Migration inventory — docs.valyd.work → Nextra (clean rebuild)

Content-only migration of the old Vite/React SPA at `/var/www/pollus_main_servers/docs`
(deployed as https://docs.valyd.work/) into this standalone Nextra 4 / Next.js 15 app using the
**default Nextra Docs Theme**. The old project is untouched. No old layout, sidebar, CSS, or
custom page components were carried over — only content.

## Page inventory (old URL → new source → status)

| Old URL | New source | New URL | Status |
| --- | --- | --- | --- |
| `/` | `content/index.mdx` | `/` | rebuilt as a standard Nextra landing page (Cards) with the old messaging |
| `/docs` (+ `/docs/overview`) | `content/docs/index.md` | `/docs` | migrated; `/docs/overview` → 301 `/docs` |
| `/docs/<section>` × 11 (quick-start, create-project, login-sessions, authentication, oidc, endpoints, scopes, request-data, organizations, errors, changelog) | `content/docs/<section>.md` | same | migrated verbatim from the curated corpus (`../docs/docs-content`) |
| `/docs/api-reference` | `content/docs/api-reference.mdx` | same | simple page linking the OpenAPI JSON + human-readable `/docs/endpoints` (old custom spec renderer intentionally not reproduced) |
| `/verifications` (+ `/verify`, `?mode=…`) | `content/verifications/index.md` | `/verifications` | migrated; old single-page `?mode=` switcher is now separate pages |
| `/verifications/<section>` × 10 | `content/verifications/<section>.md` | same | migrated; `/verify/<section>` → 301 |
| `/verifications/api` (+ `/verify/api`) | `content/verifications/api.mdx` | same | simple page linking the OpenAPI JSON (custom renderer not reproduced) |
| `/verify/ship-hosted-kyc`, `/verify/verify-license` | `content/verify/*.mdx` | same | migrated (Steps/Callout/Tabs, full code samples) |
| `/mcp` | `content/mcp.mdx` | same | migrated (all sections, tools, integrations, errors) |
| `/agents` | `content/agents.mdx` | same | migrated |
| `/evv` | `content/evv.mdx` | same | migrated (hidden from nav, like old site) |
| `/antispoof` | `content/antispoof.mdx` | same | migrated (hidden from nav) |
| `/sandbox` | `app/sandbox/` + `components/sandbox/` | same | full interactive playground ported from the old app (live issue-code → token → userinfo/licenses/verifications → refresh flow, demo users, scopes, snippets, loading/success/error states) |
| `/docs/*.md`, `/verify/*.md`, `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/openapi/*.json` | `public/…` | same | agent corpus regenerated with `.valyd.work` hosts (`scripts/migrate-content.mjs`) |
| `/valyd-postman-collection.json`, `/downloads/valyd-sdk-starter.zip`, `/favicon.png` | `public/…` | same | copied |
| `/sitemap.xml` | `app/sitemap.ts` | same | regenerated |

Total: 33 documentation pages + static corpus. Every old page is migrated, redirected, or (for
the two interactive-only surfaces: sandbox playground UI, OpenAPI spec browser) replaced by a
content page at the same URL that carries the same information and links to the machine-readable
spec — noted here explicitly rather than silently dropped.

## Redirects (all 301, no chains)

- `/docs/overview` → `/docs`
- `/verify`, `/verify/intro`, `/verifications/intro` → `/verifications`
- `/verify/<section>` → `/verifications/<section>` (quickstart, console, modes, hosted,
  standalone, managed, sdk, webhooks, statuses, api-reference)
- `/verify/api` → `/verifications/api`

## Known behavior changes

- Default Nextra theme everywhere: Nextra sidebar/TOC replaces the old scroll-spy sidebars; the
  Verification docs' `?mode=` switcher became separate hosted/standalone/managed pages.
- Search is Pagefind instead of the old hand-maintained index.
- Only branding kept: Valyd logo mark in the navbar + brand cyan as the theme hue (hue 196).
