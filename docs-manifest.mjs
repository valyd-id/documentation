// SINGLE SOURCE OF TRUTH for the docs information architecture.
// MODULE-SCOPED sidebars: each top-nav tab (Docs / Verify / AI) shows ONLY its own sections.
// Sections carry a `tab` ('docs' | 'verify' | 'ai'); each folder's _meta renders just its tab's
// sections. A page whose `home` differs from the tab is referenced by `href`.
//
// PRODUCT MODEL (public): exactly TWO products —
//   • Unique Human API      → API-key calls that answer "is this a live, unique human?"
//   • Reusable Verification → Connect with Valyd (OIDC) + read verified data + workflows
// There is no third lane; Connect with Valyd is part of Reusable Verification. The old
// lane/hosted/standalone/account terminology is retired from the public docs.
//
// Consumed by: scripts/check-nav-consistency.mjs (fails the build if a nav page / stub / secondary
// / capability doc doesn't resolve). The _meta.tsx files are hand-authored; this manifest is what
// the gate validates them against.
//
// Fields: title, route, home ('docs'|'verifications'|'ai'|'ext'), icon (lucide name, metadata only),
// group (sub-heading within a section), tab (which navbar tab owns the section).

export const SECTIONS = [
  // ================= DOCS tab — the platform =================
  {
    id: 'get-started', label: 'GET STARTED', tab: 'docs',
    items: [
      { title: 'Overview', route: '/docs/introduction', home: 'docs', icon: 'BookOpen' },
      { title: 'How Valyd works', route: '/docs/how-valyd-works', home: 'docs', icon: 'Sparkles' },
      { title: 'Create an account', route: '/docs/create-account', home: 'docs', icon: 'UserPlus' },
      { title: 'Apps & API keys', route: '/docs/create-project', home: 'docs', icon: 'LayoutDashboard' },
      { title: 'Quickstarts', route: '/docs/quickstarts', home: 'docs', icon: 'Rocket' },
      { title: 'Node.js', route: '/docs/quickstart/node', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
      { title: 'Next.js', route: '/docs/quickstart/nextjs', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
      { title: 'Python', route: '/docs/quickstart/python', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
      { title: 'Laravel', route: '/docs/quickstart/php', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
      { title: 'Raw HTTP', route: '/docs/quickstart/curl', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
    ],
  },
  {
    id: 'connect', label: 'CONNECT WITH VALYD', tab: 'docs',
    items: [
      { title: 'Overview', route: '/docs', home: 'docs', icon: 'KeyRound' },
      { title: 'Add Connect with Valyd', route: '/docs/authentication', home: 'docs', icon: 'LogIn' },
      { title: 'OIDC integration', route: '/docs/oidc', home: 'docs', icon: 'Fingerprint' },
      { title: 'Scopes & claims', route: '/docs/scopes', home: 'docs', icon: 'Tags' },
      { title: 'Tokens & sessions', route: '/docs/tokens', home: 'docs', icon: 'KeyRound' },
    ],
  },
  {
    id: 'organizations', label: 'ORGANIZATIONS', tab: 'docs',
    items: [
      { title: 'Overview', route: '/docs/organizations', home: 'docs', icon: 'Users' },
      { title: 'Members', route: '/docs/organizations/members', home: 'docs', icon: 'UserPlus' },
      { title: 'Roles', route: '/docs/organizations/roles', home: 'docs', icon: 'Shield' },
      { title: 'Workforce onboarding', route: '/docs/organizations/onboarding', home: 'docs', icon: 'UserCog' },
      { title: 'API', route: '/docs/organizations/api', home: 'docs', icon: 'Code' },
    ],
  },
  {
    id: 'develop', label: 'BUILD & TEST', tab: 'docs',
    items: [
      { title: 'Developer accounts', route: '/docs/developer-accounts', home: 'docs', icon: 'UserCog' },
      { title: 'Environments & credentials', route: '/docs/environments', home: 'docs', icon: 'KeyRound' },
      { title: 'Testing', route: '/docs/testing', home: 'docs', icon: 'FlaskConical' },
      { title: 'Customization', route: '/docs/customize', home: 'docs', icon: 'Settings' },
      { title: 'Errors', route: '/docs/errors', home: 'docs', icon: 'AlertTriangle' },
      { title: 'Rate limits', route: '/docs/rate-limits', home: 'docs', icon: 'Gauge' },
      { title: 'Idempotency', route: '/docs/idempotency', home: 'docs', icon: 'Braces' },
      // Security & data + Status/reliability are landing pages; their sub-pages are on-page cards
      // (see SECONDARY) to keep the sidebar short.
      { title: 'Security & data', route: '/docs/data-and-trust', home: 'docs', icon: 'ShieldCheck' },
      { title: 'Go live', route: '/docs/go-live', home: 'docs', icon: 'Rocket' },
      { title: 'Status / reliability', route: '/docs/operations-sla', home: 'docs', icon: 'Timer' },
      { title: 'Changelog', route: '/docs/changelog', home: 'docs', icon: 'History' },
      { title: 'Deprecations', route: '/docs/deprecations', home: 'docs', icon: 'History' },
    ],
  },
  {
    id: 'reference-docs', label: 'REFERENCE', tab: 'docs',
    items: [
      { title: 'Account API', route: '/docs/endpoints', home: 'docs', icon: 'Code' },
      { title: 'OpenAPI', route: '/docs/api-reference', home: 'docs', icon: 'Braces' },
      { title: 'SDKs & tools', route: '/docs/sdks', home: 'docs', icon: 'Braces' },
    ],
  },
  {
    id: 'playground', label: 'API PLAYGROUND', tab: 'docs',
    items: [
      { title: 'API Playground', route: '/docs/sandbox', home: 'docs', icon: 'Play' },
    ],
  },

  // ================= VERIFY tab — the two products =================
  {
    id: 'unique-human', label: 'UNIQUE HUMAN API', tab: 'verify',
    items: [
      { title: 'Overview', route: '/verifications/standalone', home: 'verifications', icon: 'Zap' },
      { title: 'Liveness', route: '/verifications/standalone/antispoof', home: 'verifications', icon: 'ScanFace' },
      { title: 'Uniqueness', route: '/verifications/standalone/face-uniqueness', home: 'verifications', icon: 'Fingerprint' },
    ],
  },
  {
    id: 'reusable', label: 'REUSABLE VERIFICATION', tab: 'verify',
    items: [
      { title: 'Overview', route: '/verifications', home: 'verifications', icon: 'ShieldCheck' },
      { title: 'Connect with Valyd', route: '/docs/authentication', home: 'docs', icon: 'LogIn' },
      { title: 'Read verified data', route: '/docs/user-token/account', home: 'docs', icon: 'BookOpen' },
      { title: 'Consent & data access', route: '/verifications/data-sharing', home: 'verifications', icon: 'ShieldCheck' },
      { title: 'Overview', route: '/verifications/workflows', home: 'verifications', icon: 'Braces', group: 'Workflows' },
      { title: 'Create a workflow', route: '/verifications/setup', home: 'verifications', icon: 'Settings', group: 'Workflows' },
      { title: 'Run a verification', route: '/verifications/quickstart', home: 'verifications', icon: 'Rocket', group: 'Workflows' },
      { title: 'Checks reference', route: '/verifications/types', home: 'verifications', icon: 'Tags', group: 'Workflows' },
      { title: 'Results & decisions', route: '/verifications/statuses', home: 'verifications', icon: 'ShieldCheck' },
      { title: 'Session lifecycle', route: '/verifications/session-lifecycle', home: 'verifications', icon: 'History' },
      { title: 'Webhooks', route: '/verifications/webhooks', home: 'verifications', icon: 'Braces' },
    ],
  },
  {
    id: 'verify-reference', label: 'REFERENCE', tab: 'verify',
    items: [
      { title: 'Node SDK', route: '/verifications/sdk', home: 'verifications', icon: 'Braces' },
      { title: 'Versioning', route: '/verifications/versioning', home: 'verifications', icon: 'History' },
    ],
  },

  // ================= AI & AGENTS tab =================
  {
    id: 'ai', label: 'AI & AGENTS', tab: 'ai',
    items: [
      { title: 'Overview', route: '/ai', home: 'ai', icon: 'Bot' },
      { title: 'Agent integration guide', route: '/ai/agent-guide', home: 'ai', icon: 'Bot' },
      { title: 'Machine-readable docs', route: '/ai/machine-readable', home: 'ai', icon: 'Braces' },
      { title: 'Quickstart', route: '/ai/mcp-setup', home: 'ai', icon: 'Rocket', group: 'MCP' },
      { title: 'Tools', route: '/ai/mcp-tools', home: 'ai', icon: 'Code', group: 'MCP' },
      { title: 'Authentication', route: '/ai/mcp-auth', home: 'ai', icon: 'KeyRound', group: 'MCP' },
    ],
  },
]

// Pages reachable by URL but hidden from nav + excluded from the corpus/search, each pointing at a
// canonical page (SEO/agent hygiene for duplicate/legacy routes).
export const STUBS = [
  { route: '/docs/quick-start', canonical: '/docs/quickstart/node', status: 'stub' },
  { route: '/docs/flows/account-connected', canonical: '/verifications', status: 'stub' },
  { route: '/docs/flows/hosted-verification', canonical: '/verifications/quickstart', status: 'stub' },
  { route: '/docs/login-sessions', canonical: '/docs/tokens', status: 'stub' },
  { route: '/verifications/modes', canonical: '/docs/introduction', status: 'stub' },
  { route: '/docs/user-token/hosted', canonical: '/verifications/quickstart', status: 'stub' },
  { route: '/docs/user-token/face-match', canonical: '/verifications/types', status: 'stub' },
  { route: '/docs/user-token/liveness', canonical: '/verifications/standalone/antispoof', status: 'stub' },
  { route: '/docs/user-token/license', canonical: '/verifications/types', status: 'stub' },
  { route: '/docs/user-token/age', canonical: '/verifications/types', status: 'stub' },
  { route: '/docs/sessions', canonical: '/docs/tokens', status: 'stub' },
  // Retired concept pages (old product model) → their new homes.
  { route: '/docs/choose', canonical: '/docs/introduction', status: 'stub' },
  { route: '/verifications/managed', canonical: '/verifications', status: 'stub' },
  { route: '/verifications/hosted', canonical: '/verifications/quickstart', status: 'stub' },
  // Paused APIs — capabilities exist only as workflow checks; per-check API pages are withdrawn.
  { route: '/verifications/standalone/id-verification', canonical: '/verifications/types', status: 'stub' },
  { route: '/verifications/standalone/face-match', canonical: '/verifications/types', status: 'stub' },
  { route: '/verifications/standalone/age-verification', canonical: '/verifications/types', status: 'stub' },
  { route: '/verifications/standalone/credential-verification', canonical: '/verifications/types', status: 'stub' },
  { route: '/verifications/standalone/kyc-credential', canonical: '/verifications/types', status: 'stub' },
  { route: '/verifications/standalone/location', canonical: '/verifications/types', status: 'stub' },
  { route: '/verifications/standalone/liveness', canonical: '/verifications/standalone/antispoof', status: 'stub' },
]

export const ALL_NAV_ROUTES = [...new Set(SECTIONS.flatMap((s) => s.items.map((i) => i.route)))]

// Reachable + indexed canonical pages that are intentionally NOT sidebar rows — surfaced as
// on-page cards on their parent landing page instead, to keep the sidebar short. NOT stubs.
export const SECONDARY = [
  { route: '/docs/security-trust', parent: '/docs/data-and-trust' },
  { route: '/docs/data-retention', parent: '/docs/data-and-trust' },
  { route: '/docs/data-residency', parent: '/docs/data-and-trust' },
  { route: '/docs/api-key-lifecycle', parent: '/docs/data-and-trust' },
  { route: '/docs/security-disclosure', parent: '/docs/data-and-trust' },
  { route: '/docs/audit-logging', parent: '/docs/data-and-trust' },
  { route: '/docs/disaster-recovery', parent: '/docs/operations-sla' },
  { route: '/docs/support-escalation', parent: '/docs/operations-sla' },
]

// ---- Page registry (rich metadata) -----------------------------------------------------------
const OVERRIDES = {}

const _sectionOf = (route) => (SECTIONS.find((s) => s.items.some((i) => i.route === route)) || {}).id || null
const _titleOf = (route) => {
  for (const s of SECTIONS) { const it = s.items.find((i) => i.route === route); if (it) return it.title }
  return null
}
const idFor = (route) => (route.replace(/^\//, '').replace(/\//g, '.') || 'home')

/** Full metadata for a route (nav item OR stub). */
export function pageMeta(route) {
  const stub = STUBS.find((s) => s.route === route)
  const inNav = ALL_NAV_ROUTES.includes(route)
  const aliases = STUBS.filter((s) => s.canonical === route).map((s) => s.route)
  const base = {
    id: idFor(route),
    route,
    title: _titleOf(route),
    section: _sectionOf(route),
    canonical: !stub,
    canonicalRoute: stub ? stub.canonical : route,
    nav: inNav && !stub,
    llms: !stub,
    sitemap: !stub,
    agentIndex: !stub,
    search: !stub,
    noindex: !!stub,
    status: stub ? stub.status || 'stub' : 'active',
    audience: ['human', 'agent'],
    aliases,
  }
  return { ...base, ...(OVERRIDES[route] || {}) }
}

/** Every route the registry knows about (nav items + stubs). */
export function allRoutes() {
  return [...new Set([...ALL_NAV_ROUTES, ...STUBS.map((s) => s.route)])]
}

/** Canonical routes only (nav pages; stubs excluded). */
export function canonicalRoutes() {
  return ALL_NAV_ROUTES.filter((r) => pageMeta(r).canonical)
}
