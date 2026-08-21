// SINGLE SOURCE OF TRUTH for the docs information architecture (second-audit IA).
// The exact 9-section unified sidebar the owner specified. Every folder's _meta renders these
// sections in this order (own-folder pages in full detail; other sections as flat href links),
// so a reader sees the same 9 headings whichever route tree they're in.
//
// Consumed by: scripts/gen-nav.mjs (llms.txt index + sitemap), scripts/check-nav-consistency.mjs
// (fails the build if a nav:true page is missing from a sidebar, or a capability's doc target
// isn't a canonical page here). The _meta.tsx files stay hand-authored (owner chose a consistency
// GATE over a generator); this manifest is what the gate validates them against.
//
// Fields: title (sidebar label), route, home ('docs'|'verifications'|'ai'|'ext'), icon (lucide),
// group (optional sub-heading within a section), nav (in a sidebar), llms (in llms.txt index),
// agentIndex (in the machine corpus), sitemap, noindex, canonical (a canonical content page),
// status ('active'|'stub'|'draft'), aliases (old routes kept resolvable).

export const SECTIONS = [
  {
    id: 'get-started', label: 'GET STARTED',
    items: [
      { title: 'Overview', route: '/docs/introduction', home: 'docs', icon: 'BookOpen' },
      { title: 'How Valyd works', route: '/docs/how-valyd-works', home: 'docs', icon: 'Sparkles' },
      { title: 'Choose your integration', route: '/docs/choose', home: 'docs', icon: 'Signpost' },
      { title: 'Create an account', route: '/docs/create-account', home: 'docs', icon: 'UserPlus' },
      { title: 'Quickstarts', route: '/docs/quickstarts', home: 'docs', icon: 'Rocket' },
      { title: 'Node.js', route: '/docs/quickstart/node', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
      { title: 'Next.js', route: '/docs/quickstart/nextjs', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
      { title: 'Python', route: '/docs/quickstart/python', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
      { title: 'Laravel', route: '/docs/quickstart/php', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
      { title: 'Raw HTTP', route: '/docs/quickstart/curl', home: 'docs', icon: 'Rocket', group: 'Quickstarts' },
    ],
  },
  {
    id: 'login', label: 'LOGIN',
    items: [
      { title: 'Overview', route: '/docs', home: 'docs', icon: 'KeyRound' },
      { title: 'Add Login with Valyd', route: '/docs/authentication', home: 'docs', icon: 'LogIn' },
      { title: 'OIDC integration', route: '/docs/oidc', home: 'docs', icon: 'Fingerprint' },
      { title: 'Scopes & claims', route: '/docs/scopes', home: 'docs', icon: 'Tags' },
      { title: 'Tokens & login sessions', route: '/docs/tokens', home: 'docs', icon: 'KeyRound' },
    ],
  },
  {
    id: 'reusable', label: 'REUSABLE IDENTITY',
    items: [
      { title: 'Overview', route: '/docs/user-token', home: 'docs', icon: 'ShieldCheck' },
      { title: 'Read proofs', route: '/docs/user-token/account', home: 'docs', icon: 'BookOpen' },
      { title: 'Verify & save a proof', route: '/verifications/managed', home: 'verifications', icon: 'ShieldCheck' },
      { title: 'Request raw data', route: '/docs/request-data', home: 'docs', icon: 'Lock' },
      { title: 'Consent', route: '/verifications/data-sharing', home: 'verifications', icon: 'ShieldCheck' },
    ],
  },
  {
    id: 'verification', label: 'VERIFICATION',
    items: [
      { title: 'Overview', route: '/verifications', home: 'verifications', icon: 'ScanFace' },
      { title: 'Setup', route: '/verifications/setup', home: 'verifications', icon: 'Settings' },
      { title: 'Verification types', route: '/verifications/types', home: 'verifications', icon: 'Tags' },
      { title: 'Hosted verification', route: '/verifications/hosted', home: 'verifications', icon: 'Globe', group: 'Hosted' },
      { title: 'Quickstart', route: '/verifications/quickstart', home: 'verifications', icon: 'Rocket', group: 'Hosted' },
      { title: 'Workflows', route: '/verifications/workflows', home: 'verifications', icon: 'Braces', group: 'Hosted' },
      { title: 'Session lifecycle', route: '/verifications/session-lifecycle', home: 'verifications', icon: 'History', group: 'Hosted' },
      { title: 'Results & decisions', route: '/verifications/statuses', home: 'verifications', icon: 'ShieldCheck', group: 'Hosted' },
      { title: 'Webhooks', route: '/verifications/webhooks', home: 'verifications', icon: 'Braces', group: 'Hosted' },
      { title: 'ID / KYC', route: '/verifications/standalone/id-verification', home: 'verifications', icon: 'Fingerprint', group: 'Direct API' },
      { title: 'Liveness', route: '/verifications/standalone/liveness', home: 'verifications', icon: 'ScanFace', group: 'Direct API' },
      { title: 'Anti-spoof', route: '/verifications/standalone/antispoof', home: 'verifications', icon: 'ShieldAlert', group: 'Direct API' },
      { title: 'Face match', route: '/verifications/standalone/face-match', home: 'verifications', icon: 'ScanFace', group: 'Direct API' },
      { title: 'Face uniqueness', route: '/verifications/standalone/face-uniqueness', home: 'verifications', icon: 'ScanFace', group: 'Direct API' },
      { title: 'Age', route: '/verifications/standalone/age-verification', home: 'verifications', icon: 'Tags', group: 'Direct API' },
      { title: 'Location', route: '/verifications/standalone/location', home: 'verifications', icon: 'Globe', group: 'Direct API' },
      { title: 'Credentials', route: '/verifications/standalone/credential-verification', home: 'verifications', icon: 'ShieldCheck', group: 'Direct API' },
      { title: 'KYC + credential', route: '/verifications/standalone/kyc-credential', home: 'verifications', icon: 'Fingerprint', group: 'Direct API' },
    ],
  },
  {
    id: 'organizations', label: 'ORGANIZATIONS',
    items: [
      { title: 'Overview', route: '/docs/organizations', home: 'docs', icon: 'Users' },
      { title: 'Members', route: '/docs/organizations/members', home: 'docs', icon: 'UserPlus' },
      { title: 'Roles', route: '/docs/organizations/roles', home: 'docs', icon: 'Shield' },
      { title: 'Workforce onboarding', route: '/docs/organizations/onboarding', home: 'docs', icon: 'UserCog' },
      { title: 'API', route: '/docs/organizations/api', home: 'docs', icon: 'Code' },
    ],
  },
  {
    id: 'develop', label: 'DEVELOP & OPERATE',
    items: [
      { title: 'Developer Portal', route: '/docs/create-project', home: 'docs', icon: 'LayoutDashboard' },
      { title: 'Developer accounts', route: '/docs/developer-accounts', home: 'docs', icon: 'UserCog' },
      { title: 'Environments & credentials', route: '/docs/environments', home: 'docs', icon: 'KeyRound' },
      { title: 'Testing', route: '/docs/testing', home: 'docs', icon: 'FlaskConical' },
      { title: 'Customization', route: '/docs/customize', home: 'docs', icon: 'Settings' },
      { title: 'Errors', route: '/docs/errors', home: 'docs', icon: 'AlertTriangle' },
      { title: 'Rate limits', route: '/docs/rate-limits', home: 'docs', icon: 'Gauge' },
      { title: 'Idempotency', route: '/docs/idempotency', home: 'docs', icon: 'Braces' },
      { title: 'Security & data', route: '/docs/data-and-trust', home: 'docs', icon: 'ShieldCheck' },
      { title: 'Trust Center', route: '/docs/security-trust', home: 'docs', icon: 'Lock', group: 'Security & data' },
      { title: 'Data retention', route: '/docs/data-retention', home: 'docs', icon: 'Database', group: 'Security & data' },
      { title: 'Data residency', route: '/docs/data-residency', home: 'docs', icon: 'Globe', group: 'Security & data' },
      { title: 'API key lifecycle', route: '/docs/api-key-lifecycle', home: 'docs', icon: 'KeyRound', group: 'Security & data' },
      { title: 'Security disclosure', route: '/docs/security-disclosure', home: 'docs', icon: 'ShieldAlert', group: 'Security & data' },
      { title: 'Audit logging', route: '/docs/audit-logging', home: 'docs', icon: 'ScrollText', group: 'Security & data' },
      { title: 'Go live', route: '/docs/go-live', home: 'docs', icon: 'Rocket' },
      { title: 'Status / reliability', route: '/docs/operations-sla', home: 'docs', icon: 'Timer' },
      { title: 'Disaster recovery', route: '/docs/disaster-recovery', home: 'docs', icon: 'DatabaseBackup', group: 'Status / reliability' },
      { title: 'Support & escalation', route: '/docs/support-escalation', home: 'docs', icon: 'LifeBuoy', group: 'Status / reliability' },
      { title: 'Versioning', route: '/verifications/versioning', home: 'verifications', icon: 'History' },
      { title: 'Changelog', route: '/docs/changelog', home: 'docs', icon: 'History' },
      { title: 'Deprecations', route: '/docs/deprecations', home: 'docs', icon: 'History' },
    ],
  },
  {
    id: 'reference', label: 'REFERENCE',
    items: [
      { title: 'Login API', route: '/docs/endpoints', home: 'docs', icon: 'Code' },
      { title: 'Verification API', route: '/verifications/api-reference', home: 'verifications', icon: 'Code' },
      { title: 'Node SDK', route: '/verifications/sdk', home: 'verifications', icon: 'Braces' },
      { title: 'SDKs & tools', route: '/docs/sdks', home: 'docs', icon: 'Braces' },
      { title: 'Login OpenAPI', route: '/docs/api-reference', home: 'docs', icon: 'Braces' },
      { title: 'Verification OpenAPI', route: '/verifications/api', home: 'verifications', icon: 'Braces' },
      { title: 'Raw HTTP', route: '/verifications/standalone/http', home: 'verifications', icon: 'Code' },
    ],
  },
  {
    id: 'ai', label: 'AI & AGENTS',
    items: [
      { title: 'Overview', route: '/ai', home: 'ai', icon: 'Bot' },
      { title: 'Agent integration guide', route: '/ai/agent-guide', home: 'ai', icon: 'Bot' },
      { title: 'Machine-readable docs', route: '/ai/machine-readable', home: 'ai', icon: 'Braces' },
      { title: 'Quickstart', route: '/ai/mcp-setup', home: 'ai', icon: 'Rocket', group: 'MCP' },
      { title: 'Tools', route: '/ai/mcp-tools', home: 'ai', icon: 'Code', group: 'MCP' },
      { title: 'Authentication', route: '/ai/mcp-auth', home: 'ai', icon: 'KeyRound', group: 'MCP' },
    ],
  },
  {
    id: 'playground', label: 'API PLAYGROUND',
    items: [
      { title: 'API Playground', route: '/docs/sandbox', home: 'docs', icon: 'Play' },
    ],
  },
]

// Pages that stay reachable by URL but are hidden from nav + excluded from the machine corpus and
// search, with a canonical target (SEO/agent hygiene for the second-audit "duplicate pages").
export const STUBS = [
  { route: '/docs/quick-start', canonical: '/docs/quickstart/node', status: 'stub' },
  { route: '/docs/flows/account-connected', canonical: '/verifications/managed', status: 'stub' },
  { route: '/docs/flows/hosted-verification', canonical: '/verifications/hosted', status: 'stub' },
  { route: '/docs/login-sessions', canonical: '/docs/tokens', status: 'stub' },
  { route: '/verifications/modes', canonical: '/docs/choose', status: 'stub' },
  { route: '/docs/user-token/hosted', canonical: '/verifications/hosted', status: 'stub' },
  { route: '/docs/user-token/face-match', canonical: '/verifications/standalone/face-match', status: 'stub' },
  { route: '/docs/user-token/liveness', canonical: '/verifications/standalone/liveness', status: 'stub' },
  { route: '/docs/user-token/license', canonical: '/verifications/standalone/credential-verification', status: 'stub' },
  { route: '/docs/user-token/age', canonical: '/verifications/standalone/age-verification', status: 'stub' },
  { route: '/docs/sessions', canonical: '/docs/tokens', status: 'stub' },
]

export const ALL_NAV_ROUTES = SECTIONS.flatMap((s) => s.items.map((i) => i.route))

// ---- Page registry (rich metadata) -----------------------------------------------------------
// The manifest is the canonical page registry, not just a sidebar. Every route carries enough
// metadata for human nav AND machine indexing. Values are computed from SECTIONS + STUBS with a
// small OVERRIDES map, so the 75 nav rows don't each need hand-authored flags.

// Per-route overrides (only where the computed default is wrong).
const OVERRIDES = {
  // (reserved) e.g. a page that should be canonical + reachable but out of nav, or a draft page.
}

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
    canonical: !stub, // a stub is NOT canonical — it points at one
    canonicalRoute: stub ? stub.canonical : route,
    nav: inNav && !stub, // in a sidebar
    llms: !stub, // in the llms.txt index
    sitemap: !stub, // in the sitemap
    agentIndex: !stub, // in the machine corpus (llms-full / agent bundle)
    search: !stub, // in pagefind search
    noindex: !!stub, // robots noindex
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

/** Canonical routes only (nav pages; stubs excluded). Used by capability→canonical checks. */
export function canonicalRoutes() {
  return ALL_NAV_ROUTES.filter((r) => pageMeta(r).canonical)
}
