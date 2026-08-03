# Valyd Developer Docs

Documentation site for Valyd — Login with Valyd (OAuth 2.0 / OIDC), the Verification APIs
(KYC, liveness, face match, license), and MCP for AI agents. Built with the **default Nextra
Docs Theme**; the only visual customization is the Valyd logo and brand hue. Content was
migrated from the old Vite SPA in `../docs` (left untouched). Currently runs at localhost only.

## Stack

- Next.js 15 (App Router) + React 19
- Nextra 4 + `nextra-theme-docs` — default theme, layout, sidebar, TOC, search, dark mode
- Pagefind search (indexed post-build)
- TypeScript + ESLint

Requires **Node.js ≥ 20.9**. Package manager: **npm**.

> Note: `package.json` pins `zod@4.1.12` for the nextra packages via `overrides` — zod ≥ 4.4
> breaks Nextra 4.6's prop validation (every page 500s). Don't remove it until Nextra ships a fix.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:3000 (search needs a prod build)
npm run build        # production build + pagefind index (postbuild)
npm start            # serve the production build at http://localhost:3000
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run check-links  # verify every internal link resolves
```

Search only works after `npm run build` (the `postbuild` script runs Pagefind over
`.next/server/app` into `public/_pagefind/`, which is git-ignored).

## Project structure

```
app/
  layout.tsx            # Nextra default Layout + Navbar/Footer, brand hue, root metadata
  [[...mdxPath]]/page.tsx  # renders every page in content/ (Nextra catch-all)
  sitemap.ts            # sitemap.xml
content/                # ALL documentation pages (Markdown/MDX only — no custom components)
  _meta.ts              # navbar entries + hidden pages
  docs/                 # Valyd ID (login) docs      → /docs/*
  verifications/        # Verification API docs      → /verifications/*
  verify/               # recipe pages (old URLs)    → /verify/ship-hosted-kyc, /verify/verify-license
  index.mdx mcp.mdx agents.mdx sandbox.mdx evv.mdx antispoof.mdx
public/                 # favicon, logo, OpenAPI specs, downloads, agent corpus (llms.txt, *.md)
scripts/
  migrate-content.mjs   # re-import corpus from ../docs/docs-content ({{TOKEN}} → .valyd.work hosts)
  check-links.mjs       # internal link checker
```

## Editing docs

- **Add a page:** create `content/<section>/<slug>.md` (`.mdx` only if you import
  `nextra/components`), then add `'<slug>': 'Sidebar title'` to that folder's `_meta.ts` in the
  position you want. File path = URL (`index.md` → the folder URL).
- **Add a nested section:** a folder with `index.md` + its own `_meta.ts`.
- **Navbar:** top-level entries in `content/_meta.ts` (`type: 'page'`); `display: 'hidden'`
  keeps a page routable but out of the nav. The theme toggle (light/dark/system) is Nextra's
  `ThemeSwitch` rendered as `Navbar` children in `app/layout.tsx`.
- **Sidebar icons:** section `_meta.tsx` files wrap labels in `MetaTitle`
  (`components/meta-title.tsx`) with a lucide-react icon; sized/aligned by `.vd-meta-title`
  in `globals.css`.
- **Interactive sandbox:** `/sandbox` is a real app route (`app/sandbox/` +
  `components/sandbox/`) making live calls to the sandbox IdP; styled with Tailwind v4
  utilities (utilities-only layer in `globals.css`, `dark:` follows Nextra's `.dark` class).
- **Images:** put files in `public/images/`, reference as `/images/name.png`.
- **Components:** use Nextra built-ins (`Callout`, `Tabs`, `Steps`, `Cards` from
  `nextra/components`) in docs pages. Custom surfaces (homepage, sandbox) use the small
  shadcn-style kit in `components/ui/` (Button, Alert, Skeleton, Tooltip + Tabs on Radix
  primitives — the only UI deps) and the homepage blocks in `components/home.tsx`
  (`HeroGrid`/`Hero`/`HeroCode`, `Section`, `Capabilities`, `Steps`, `Resources`,
  `SupportBand`).
- **Theme toggle:** `components/theme-toggle.tsx` — one sun/moon button (no dropdown), direct
  light/dark toggle via next-themes, mounted-guard against hydration mismatch; rendered as
  `Navbar` children so it sits right of the GitHub link.
- **Logo:** original brand assets — `valyd-wordmark.png` (navy, light mode) and
  `valyd-mark.png` (white, dark mode) — swapped purely in CSS (`.vd-logo-light/dark`).
- **Branding/styling:** all customization lives in `app/globals.css` — Valyd brand tokens as
  CSS variables (`--vd-*`, light + dark under `.dark`), plus a subtle CSS-only motion layer
  (page fade-in, homepage section rise, card/button hover lifts). Rules of that file: only
  stable `nextra-*` class hooks and semantic tags, never Nextra's hashed utility classes; all
  movement is gated behind `prefers-reduced-motion: no-preference`.
- **Redirects:** old-URL 301s (e.g. `/verify/*` → `/verifications/*`) live in
  `next.config.mjs` `redirects()`. Avoid chains.
- **Hostnames:** corpus pages carry `docs.valyd.work`-environment hosts. To retarget, edit
  `TOKENS` in `scripts/migrate-content.mjs` and re-run it (hand-authored `.mdx` pages must be
  updated separately).

## Deployment

Standard Next.js server build: `npm run build && npm start` behind any reverse proxy.
Localhost-only for now.

## Troubleshooting

- **Search returns nothing** — you're on `next dev` or skipped `postbuild`; run `npm run build`.
- **Every page 500s with a zod "nonoptional" error** — the zod override was removed; restore it.
- **`next start` says no production build** — running `next dev` overwrites `.next`; re-run
  `npm run build` first.
- **MDX error about `{` or `<`** — escape prose braces in `.mdx`, or use `.md`.

See [MIGRATION.md](./MIGRATION.md) for the old→new page inventory and redirect map.
