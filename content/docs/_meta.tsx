import type { MetaRecord } from 'nextra'
import {
  AlertTriangle,
  BookOpen,
  Braces,
  Code,
  Fingerprint,
  FlaskConical,
  Gauge,
  History,
  KeyRound,
  LayoutDashboard,
  LogIn,
  Play,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  Timer,
  UserCog,
  UserPlus,
  Users
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// DOCS tab — the platform, Connect with Valyd (OIDC), and Organizations. The two verification
// products (Unique Human API, Reusable Verification) live in the Verify tab; AI in the AI tab.
export default {
  '--get-started': { type: 'separator', title: 'GET STARTED' },
  introduction: { title: <MetaTitle icon={BookOpen}>Overview</MetaTitle> },
  'how-valyd-works': { title: <MetaTitle icon={Sparkles}>How Valyd works</MetaTitle> },
  'create-account': { title: <MetaTitle icon={UserPlus}>Create an account</MetaTitle> },
  'create-project': { title: <MetaTitle icon={LayoutDashboard}>Apps &amp; API keys</MetaTitle> },
  quickstarts: { title: <MetaTitle icon={Rocket}>Quickstarts</MetaTitle> },
  quickstart: { title: 'Quickstart guides' },

  '--connect': { type: 'separator', title: 'CONNECT WITH VALYD' },
  index: { title: <MetaTitle icon={KeyRound}>Overview</MetaTitle> },
  authentication: { title: <MetaTitle icon={LogIn}>Add Connect with Valyd</MetaTitle> },
  oidc: { title: <MetaTitle icon={Fingerprint}>OIDC integration</MetaTitle> },
  scopes: { title: <MetaTitle icon={Tags}>Scopes &amp; claims</MetaTitle> },
  tokens: { title: <MetaTitle icon={KeyRound}>Tokens &amp; sessions</MetaTitle> },

  '--organizations': { type: 'separator', title: 'ORGANIZATIONS' },
  organizations: { title: <MetaTitle icon={Users}>Organizations</MetaTitle> },

  '--develop': { type: 'separator', title: 'BUILD & TEST' },
  'developer-accounts': { title: <MetaTitle icon={UserCog}>Developer accounts</MetaTitle> },
  environments: { title: <MetaTitle icon={KeyRound}>Environments &amp; credentials</MetaTitle> },
  testing: { title: <MetaTitle icon={FlaskConical}>Testing</MetaTitle> },
  customize: { title: <MetaTitle icon={Settings}>Customization</MetaTitle> },
  errors: { title: <MetaTitle icon={AlertTriangle}>Errors</MetaTitle> },
  'rate-limits': { title: <MetaTitle icon={Gauge}>Rate limits</MetaTitle> },
  idempotency: { title: <MetaTitle icon={Braces}>Idempotency</MetaTitle> },
  'data-and-trust': { title: <MetaTitle icon={ShieldCheck}>Security &amp; data</MetaTitle> },
  'go-live': { title: <MetaTitle icon={Rocket}>Go live</MetaTitle> },
  'operations-sla': { title: <MetaTitle icon={Timer}>Status / reliability</MetaTitle> },
  changelog: { title: <MetaTitle icon={History}>Changelog</MetaTitle> },
  deprecations: { title: <MetaTitle icon={History}>Deprecations</MetaTitle> },

  '--reference': { type: 'separator', title: 'REFERENCE' },
  endpoints: { title: <MetaTitle icon={Code}>Account API</MetaTitle> },
  'api-reference': { title: <MetaTitle icon={Braces}>OpenAPI</MetaTitle> },
  sdks: { title: <MetaTitle icon={Braces}>SDKs &amp; tools</MetaTitle> },

  '--playground': { type: 'separator', title: 'API PLAYGROUND' },
  sandbox: { title: <MetaTitle icon={Play}>API Playground</MetaTitle>, theme: { toc: false } },

  // Hidden in the Docs tab — the account-read pages are surfaced in the Verify tab (Reusable
  // Verification); the enterprise sub-pages are on-page cards; the rest are legacy/compat stubs.
  choose: { display: 'hidden' },
  'user-token': { display: 'hidden' },
  'request-data': { display: 'hidden' },
  'security-trust': { display: 'hidden' },
  'data-retention': { display: 'hidden' },
  'data-residency': { display: 'hidden' },
  'api-key-lifecycle': { display: 'hidden' },
  'security-disclosure': { display: 'hidden' },
  'audit-logging': { display: 'hidden' },
  'disaster-recovery': { display: 'hidden' },
  'support-escalation': { display: 'hidden' },
  sessions: { display: 'hidden' },
  flows: { display: 'hidden' },
  'quick-start': { display: 'hidden' },
  'login-sessions': { display: 'hidden' }
} satisfies MetaRecord
