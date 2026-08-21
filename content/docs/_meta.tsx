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
  Settings,
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

// UNIFIED 9-SECTION SIDEBAR (see docs-manifest.mjs — the single source of truth).
// Every folder's _meta renders the same nine sections in manifest order, so a reader sees the
// same headings whichever route tree they're in. Pages whose `home` is THIS folder are local keys
// (full detail + correct highlight); pages that live elsewhere are flat `href` links.
export default {
  // ============================ GET STARTED ============================
  '--get-started': { type: 'separator', title: 'GET STARTED' },
  introduction: { title: <MetaTitle icon={BookOpen}>Overview</MetaTitle> },
  'how-valyd-works': { title: <MetaTitle icon={Sparkles}>How Valyd works</MetaTitle> },
  choose: { title: <MetaTitle icon={Signpost}>Choose your integration</MetaTitle> },
  'create-account': { title: <MetaTitle icon={UserPlus}>Create an account</MetaTitle> },
  quickstarts: { title: <MetaTitle icon={Rocket}>Quickstarts</MetaTitle> },
  '--qs': { type: 'separator', title: 'Quickstarts' },
  quickstart: { title: <MetaTitle icon={Rocket}>Quickstart guides</MetaTitle> },

  // ============================ LOGIN ============================
  '--login': { type: 'separator', title: 'LOGIN' },
  index: { title: <MetaTitle icon={KeyRound}>Overview</MetaTitle> },
  authentication: { title: <MetaTitle icon={LogIn}>Add Login with Valyd</MetaTitle> },
  oidc: { title: <MetaTitle icon={Fingerprint}>OIDC integration</MetaTitle> },
  scopes: { title: <MetaTitle icon={Tags}>Scopes &amp; claims</MetaTitle> },
  tokens: { title: <MetaTitle icon={KeyRound}>Tokens &amp; login sessions</MetaTitle> },

  // ============================ REUSABLE IDENTITY ============================
  '--reusable': { type: 'separator', title: 'REUSABLE IDENTITY' },
  'user-token': { title: <MetaTitle icon={ShieldCheck}>Overview</MetaTitle> },
  'rl-managed': { title: <MetaTitle icon={ShieldCheck}>Verify &amp; save a proof</MetaTitle>, href: '/verifications/managed' },
  'request-data': { title: <MetaTitle icon={Lock}>Request raw data</MetaTitle> },
  'rl-consent': { title: <MetaTitle icon={ShieldCheck}>Consent</MetaTitle>, href: '/verifications/data-sharing' },

  // ============================ VERIFICATION ============================
  '--verification': { type: 'separator', title: 'VERIFICATION' },
  'vf-overview': { title: <MetaTitle icon={ScanFace}>Overview</MetaTitle>, href: '/verifications' },
  'vf-setup': { title: <MetaTitle icon={Settings}>Setup</MetaTitle>, href: '/verifications/setup' },
  'vf-types': { title: <MetaTitle icon={Tags}>Verification types</MetaTitle>, href: '/verifications/types' },
  '--v-hosted': { type: 'separator', title: 'Hosted' },
  'vf-hosted': { title: <MetaTitle icon={Globe}>Hosted verification</MetaTitle>, href: '/verifications/hosted' },
  'vf-quickstart': { title: <MetaTitle icon={Rocket}>Quickstart</MetaTitle>, href: '/verifications/quickstart' },
  'vf-workflows': { title: <MetaTitle icon={Braces}>Workflows</MetaTitle>, href: '/verifications/workflows' },
  'vf-lifecycle': { title: <MetaTitle icon={History}>Session lifecycle</MetaTitle>, href: '/verifications/session-lifecycle' },
  'vf-statuses': { title: <MetaTitle icon={ShieldCheck}>Results &amp; decisions</MetaTitle>, href: '/verifications/statuses' },
  'vf-webhooks': { title: <MetaTitle icon={Braces}>Webhooks</MetaTitle>, href: '/verifications/webhooks' },
  '--v-direct': { type: 'separator', title: 'Direct API' },
  'vf-id': { title: <MetaTitle icon={Fingerprint}>ID / KYC</MetaTitle>, href: '/verifications/standalone/id-verification' },
  'vf-liveness': { title: <MetaTitle icon={ScanFace}>Liveness</MetaTitle>, href: '/verifications/standalone/liveness' },
  'vf-antispoof': { title: <MetaTitle icon={ShieldAlert}>Anti-spoof</MetaTitle>, href: '/verifications/standalone/antispoof' },
  'vf-facematch': { title: <MetaTitle icon={ScanFace}>Face match</MetaTitle>, href: '/verifications/standalone/face-match' },
  'vf-faceuniqueness': { title: <MetaTitle icon={ScanFace}>Face uniqueness</MetaTitle>, href: '/verifications/standalone/face-uniqueness' },
  'vf-age': { title: <MetaTitle icon={Tags}>Age</MetaTitle>, href: '/verifications/standalone/age-verification' },
  'vf-location': { title: <MetaTitle icon={Globe}>Location</MetaTitle>, href: '/verifications/standalone/location' },
  'vf-credentials': { title: <MetaTitle icon={ShieldCheck}>Credentials</MetaTitle>, href: '/verifications/standalone/credential-verification' },
  'vf-kyccred': { title: <MetaTitle icon={Fingerprint}>KYC + credential</MetaTitle>, href: '/verifications/standalone/kyc-credential' },

  // ============================ ORGANIZATIONS ============================
  '--organizations': { type: 'separator', title: 'ORGANIZATIONS' },
  organizations: { title: <MetaTitle icon={Users}>Overview</MetaTitle> },

  // ============================ DEVELOP & OPERATE ============================
  '--develop': { type: 'separator', title: 'DEVELOP & OPERATE' },
  'create-project': { title: <MetaTitle icon={LayoutDashboard}>Developer Portal</MetaTitle> },
  'developer-accounts': { title: <MetaTitle icon={UserCog}>Developer accounts</MetaTitle> },
  environments: { title: <MetaTitle icon={KeyRound}>Environments &amp; credentials</MetaTitle> },
  testing: { title: <MetaTitle icon={FlaskConical}>Testing</MetaTitle> },
  customize: { title: <MetaTitle icon={Settings}>Customization</MetaTitle> },
  errors: { title: <MetaTitle icon={AlertTriangle}>Errors</MetaTitle> },
  'rate-limits': { title: <MetaTitle icon={Gauge}>Rate limits</MetaTitle> },
  idempotency: { title: <MetaTitle icon={Braces}>Idempotency</MetaTitle> },
  'go-live': { title: <MetaTitle icon={Rocket}>Go live</MetaTitle> },
  'do-versioning': { title: <MetaTitle icon={History}>Versioning</MetaTitle>, href: '/verifications/versioning' },
  changelog: { title: <MetaTitle icon={History}>Changelog</MetaTitle> },
  deprecations: { title: <MetaTitle icon={History}>Deprecations</MetaTitle> },
  'data-and-trust': { title: <MetaTitle icon={ShieldCheck}>Security &amp; data</MetaTitle> },
  '--sec': { type: 'separator', title: 'Security & data' },
  'security-trust': { title: <MetaTitle icon={Lock}>Trust Center</MetaTitle> },
  'data-retention': { title: <MetaTitle icon={Database}>Data retention</MetaTitle> },
  'data-residency': { title: <MetaTitle icon={Globe}>Data residency</MetaTitle> },
  'api-key-lifecycle': { title: <MetaTitle icon={KeyRound}>API key lifecycle</MetaTitle> },
  'security-disclosure': { title: <MetaTitle icon={ShieldAlert}>Security disclosure</MetaTitle> },
  'audit-logging': { title: <MetaTitle icon={ScrollText}>Audit logging</MetaTitle> },
  '--status': { type: 'separator', title: 'Status / reliability' },
  'operations-sla': { title: <MetaTitle icon={Timer}>Status / reliability</MetaTitle> },
  'disaster-recovery': { title: <MetaTitle icon={DatabaseBackup}>Disaster recovery</MetaTitle> },
  'support-escalation': { title: <MetaTitle icon={LifeBuoy}>Support &amp; escalation</MetaTitle> },

  // ============================ REFERENCE ============================
  '--reference': { type: 'separator', title: 'REFERENCE' },
  endpoints: { title: <MetaTitle icon={Code}>Login API</MetaTitle> },
  'ref-vapi': { title: <MetaTitle icon={Code}>Verification API</MetaTitle>, href: '/verifications/api-reference' },
  'ref-sdk': { title: <MetaTitle icon={Braces}>Node SDK</MetaTitle>, href: '/verifications/sdk' },
  sdks: { title: <MetaTitle icon={Braces}>SDKs &amp; tools</MetaTitle> },
  'api-reference': { title: <MetaTitle icon={Braces}>Login OpenAPI</MetaTitle> },
  'ref-vopenapi': { title: <MetaTitle icon={Braces}>Verification OpenAPI</MetaTitle>, href: '/verifications/api' },
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
  sandbox: { title: <MetaTitle icon={Play}>API Playground</MetaTitle>, theme: { toc: false } },

  // ============================ Hidden (reachable by URL, out of nav) ============================
  sessions: { display: 'hidden' },
  flows: { display: 'hidden' },
  'quick-start': { display: 'hidden' },
  'login-sessions': { display: 'hidden' }
} satisfies MetaRecord
