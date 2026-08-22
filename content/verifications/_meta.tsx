import type { MetaRecord } from 'nextra'
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Braces,
  Code,
  Database,
  DatabaseBackup,
  FlaskConical,
  Fingerprint,
  Gauge,
  Globe,
  History,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogIn,
  Play,
  Rocket,
  ScanFace,
  ScrollText,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Signpost,
  Sparkles,
  Tags,
  Timer,
  UserCog,
  UserPlus,
  Users
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// UNIFIED 9-SECTION SIDEBAR (see docs-manifest.mjs). VERIFICATION, the verifications-home REUSABLE
// pages (managed, data-sharing), and the verifications-home REFERENCE pages are local; everything
// else is a flat href into its real route.
export default {
  // ============================ GET STARTED ============================
  '--get-started': { type: 'separator', title: 'GET STARTED' },
  'gs-overview': { title: <MetaTitle icon={BookOpen}>Overview</MetaTitle>, href: '/docs/introduction' },
  'gs-how': { title: <MetaTitle icon={Sparkles}>How Valyd works</MetaTitle>, href: '/docs/how-valyd-works' },
  'gs-choose': { title: <MetaTitle icon={Signpost}>Choose your integration</MetaTitle>, href: '/docs/choose' },
  'gs-account': { title: <MetaTitle icon={UserPlus}>Create an account</MetaTitle>, href: '/docs/create-account' },
  'gs-quickstarts': { title: <MetaTitle icon={Rocket}>Quickstarts</MetaTitle>, href: '/docs/quickstarts' },
  '--qs': { type: 'separator', title: 'Quickstarts' },
  'gs-node': { title: <MetaTitle icon={Rocket}>Node.js</MetaTitle>, href: '/docs/quickstart/node' },
  'gs-nextjs': { title: <MetaTitle icon={Rocket}>Next.js</MetaTitle>, href: '/docs/quickstart/nextjs' },
  'gs-python': { title: <MetaTitle icon={Rocket}>Python</MetaTitle>, href: '/docs/quickstart/python' },
  'gs-php': { title: <MetaTitle icon={Rocket}>Laravel</MetaTitle>, href: '/docs/quickstart/php' },
  'gs-curl': { title: <MetaTitle icon={Rocket}>Raw HTTP</MetaTitle>, href: '/docs/quickstart/curl' },

  // ============================ LOGIN ============================
  '--login': { type: 'separator', title: 'LOGIN' },
  'login-overview': { title: <MetaTitle icon={KeyRound}>Overview</MetaTitle>, href: '/docs' },
  'login-add': { title: <MetaTitle icon={LogIn}>Add Login with Valyd</MetaTitle>, href: '/docs/authentication' },
  'login-oidc': { title: <MetaTitle icon={Fingerprint}>OIDC integration</MetaTitle>, href: '/docs/oidc' },
  'login-scopes': { title: <MetaTitle icon={Tags}>Scopes &amp; claims</MetaTitle>, href: '/docs/scopes' },
  'login-tokens': { title: <MetaTitle icon={KeyRound}>Tokens &amp; login sessions</MetaTitle>, href: '/docs/tokens' },

  // ============================ REUSABLE IDENTITY ============================
  '--reusable': { type: 'separator', title: 'REUSABLE IDENTITY' },
  'rl-overview': { title: <MetaTitle icon={ShieldCheck}>Overview</MetaTitle>, href: '/docs/user-token' },
  'rl-readproofs': { title: <MetaTitle icon={BookOpen}>Read proofs</MetaTitle>, href: '/docs/user-token/account' },
  managed: { title: <MetaTitle icon={ShieldCheck}>Verify &amp; save a proof</MetaTitle> },
  'rl-request': { title: <MetaTitle icon={Lock}>Request raw data</MetaTitle>, href: '/docs/request-data' },
  'data-sharing': { title: <MetaTitle icon={ShieldCheck}>Consent</MetaTitle> },

  // ============================ VERIFICATION ============================
  '--verification': { type: 'separator', title: 'VERIFICATION' },
  index: { title: <MetaTitle icon={ScanFace}>Overview</MetaTitle> },
  setup: { title: <MetaTitle icon={Settings}>Setup</MetaTitle> },
  types: { title: <MetaTitle icon={Tags}>Verification types</MetaTitle> },
  '--v-hosted': { type: 'separator', title: 'Managed by Valyd' },
  hosted: { title: <MetaTitle icon={Globe}>Hosted verification</MetaTitle> },
  quickstart: { title: <MetaTitle icon={Rocket}>Quickstart</MetaTitle> },
  workflows: { title: <MetaTitle icon={Braces}>Workflows</MetaTitle> },
  'session-lifecycle': { title: <MetaTitle icon={History}>Session lifecycle</MetaTitle> },
  statuses: { title: <MetaTitle icon={ShieldCheck}>Results &amp; decisions</MetaTitle> },
  webhooks: { title: <MetaTitle icon={Braces}>Webhooks</MetaTitle> },
  '--v-direct': { type: 'separator', title: 'Verify Fresh (non account)' },
  standalone: { title: <MetaTitle icon={Server}>Liveness &amp; uniqueness</MetaTitle> },

  // ============================ ORGANIZATIONS ============================
  '--organizations': { type: 'separator', title: 'ORGANIZATIONS' },
  'org-overview': { title: <MetaTitle icon={Users}>Overview</MetaTitle>, href: '/docs/organizations' },
  'org-members': { title: <MetaTitle icon={UserPlus}>Members</MetaTitle>, href: '/docs/organizations/members' },
  'org-roles': { title: <MetaTitle icon={Shield}>Roles</MetaTitle>, href: '/docs/organizations/roles' },
  'org-onboarding': { title: <MetaTitle icon={UserCog}>Workforce onboarding</MetaTitle>, href: '/docs/organizations/onboarding' },
  'org-api': { title: <MetaTitle icon={Code}>API</MetaTitle>, href: '/docs/organizations/api' },

  // ============================ DEVELOP & OPERATE ============================
  '--develop': { type: 'separator', title: 'DEVELOP & OPERATE' },
  'dev-portal': { title: <MetaTitle icon={LayoutDashboard}>Developer Portal</MetaTitle>, href: '/docs/create-project' },
  'dev-accounts': { title: <MetaTitle icon={UserCog}>Developer accounts</MetaTitle>, href: '/docs/developer-accounts' },
  'dev-environments': { title: <MetaTitle icon={KeyRound}>Environments &amp; credentials</MetaTitle>, href: '/docs/environments' },
  'dev-testing': { title: <MetaTitle icon={FlaskConical}>Testing</MetaTitle>, href: '/docs/testing' },
  'dev-customize': { title: <MetaTitle icon={Settings}>Customization</MetaTitle>, href: '/docs/customize' },
  'dev-errors': { title: <MetaTitle icon={AlertTriangle}>Errors</MetaTitle>, href: '/docs/errors' },
  'dev-ratelimits': { title: <MetaTitle icon={Gauge}>Rate limits</MetaTitle>, href: '/docs/rate-limits' },
  'dev-idempotency': { title: <MetaTitle icon={Braces}>Idempotency</MetaTitle>, href: '/docs/idempotency' },
  'dev-golive': { title: <MetaTitle icon={Rocket}>Go live</MetaTitle>, href: '/docs/go-live' },
  versioning: { title: <MetaTitle icon={History}>Versioning</MetaTitle> },
  'dev-changelog': { title: <MetaTitle icon={History}>Changelog</MetaTitle>, href: '/docs/changelog' },
  'dev-deprecations': { title: <MetaTitle icon={History}>Deprecations</MetaTitle>, href: '/docs/deprecations' },
  'dev-security': { title: <MetaTitle icon={ShieldCheck}>Security &amp; data</MetaTitle>, href: '/docs/data-and-trust' },
  'dev-status': { title: <MetaTitle icon={Timer}>Status / reliability</MetaTitle>, href: '/docs/operations-sla' },

  // ============================ REFERENCE ============================
  '--reference': { type: 'separator', title: 'REFERENCE' },
  'ref-loginapi': { title: <MetaTitle icon={Code}>Login API</MetaTitle>, href: '/docs/endpoints' },
  'api-reference': { title: <MetaTitle icon={Code}>Verification API</MetaTitle> },
  sdk: { title: <MetaTitle icon={Braces}>Node SDK</MetaTitle> },
  'ref-sdks': { title: <MetaTitle icon={Braces}>SDKs &amp; tools</MetaTitle>, href: '/docs/sdks' },
  'ref-loginopenapi': { title: <MetaTitle icon={Braces}>Login OpenAPI</MetaTitle>, href: '/docs/api-reference' },
  api: { title: <MetaTitle icon={Braces}>Verification OpenAPI</MetaTitle> },
  'ref-http': { title: <MetaTitle icon={Code}>Raw HTTP</MetaTitle>, href: '/verifications/standalone/http' },

  // ============================ AI & AGENTS ============================
  '--ai': { type: 'separator', title: 'AI & AGENTS' },
  'ai-overview': { title: <MetaTitle icon={Bot}>Overview</MetaTitle>, href: '/ai' },
  'ai-guide': { title: <MetaTitle icon={Bot}>Agent integration guide</MetaTitle>, href: '/ai/agent-guide' },
  'ai-machine': { title: <MetaTitle icon={Braces}>Machine-readable docs</MetaTitle>, href: '/ai/machine-readable' },
  '--ai-mcp': { type: 'separator', title: 'MCP' },
  'ai-mcp-setup': { title: <MetaTitle icon={Rocket}>Quickstart</MetaTitle>, href: '/ai/mcp-setup' },
  'ai-mcp-tools': { title: <MetaTitle icon={Code}>Tools</MetaTitle>, href: '/ai/mcp-tools' },
  'ai-mcp-auth': { title: <MetaTitle icon={KeyRound}>Authentication</MetaTitle>, href: '/ai/mcp-auth' },

  // ============================ API PLAYGROUND ============================
  '--playground': { type: 'separator', title: 'API PLAYGROUND' },
  'pg-sandbox': { title: <MetaTitle icon={Play}>API Playground</MetaTitle>, href: '/docs/sandbox' },

  // ============================ Hidden (reachable by URL, out of nav) ============================
  console: { display: 'hidden' },
  modes: { display: 'hidden' }
} satisfies MetaRecord
