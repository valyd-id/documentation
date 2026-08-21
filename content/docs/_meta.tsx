import type { MetaRecord } from 'nextra'
import {
  Sparkles,
  Settings,
  AlertTriangle,
  Braces,
  BookOpen,
  Code,
  Database,
  DatabaseBackup,
  Fingerprint,
  FlaskConical,
  Gauge,
  Globe,
  History,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  Rocket,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Signpost,
  Tags,
  Timer,
  UserCog,
  UserPlus,
  Users
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Goal-first router (see the IA audit). Three separate concepts kept apart:
//   1. LOGIN WITH VALYD  — sign a user in, read their account.
//   2. REUSABLE IDENTITY — verify with the user's token, proofs live on the account.
//   3. VERIFY (its own route) — delivery (Hosted vs Direct API) × data ownership.
// Login, verification delivery, and data ownership are NOT competing integration
// types — the sidebar names each explicitly so a newcomer sees the 4-5 pages
// they need. Merged/deprecated pages stay reachable by URL but hidden from nav.
export default {
  '--get-started': { type: 'separator', title: 'Get started' },
  introduction: { title: <MetaTitle icon={BookOpen}>Introduction</MetaTitle> },
  choose: { title: <MetaTitle icon={Signpost}>Choose your integration</MetaTitle> },
  'create-account': { title: <MetaTitle icon={UserPlus}>Create your account</MetaTitle> },
  'how-valyd-works': { title: <MetaTitle icon={Sparkles}>How Valyd works</MetaTitle> },
  quickstarts: { title: <MetaTitle icon={Rocket}>Quickstarts</MetaTitle> },
  quickstart: { title: 'Quickstart guides' },

  '--login': { type: 'separator', title: 'Login with Valyd' },
  index: { title: <MetaTitle icon={KeyRound}>Overview</MetaTitle> },
  oidc: { title: <MetaTitle icon={Fingerprint}>OIDC integration</MetaTitle> },
  scopes: { title: <MetaTitle icon={Tags}>Scopes &amp; claims</MetaTitle> },
  tokens: { title: <MetaTitle icon={KeyRound}>Tokens &amp; sessions</MetaTitle> },
  sessions: { title: <MetaTitle icon={History}>Login sessions &amp; tokens</MetaTitle> },
  authentication: { title: <MetaTitle icon={KeyRound}>Raw HTTP flow</MetaTitle> },
  flows: { title: 'Login flows' },
  'request-data': { title: <MetaTitle icon={ShieldCheck}>Request user data</MetaTitle> },
  endpoints: { title: <MetaTitle icon={Code}>Login API Reference</MetaTitle> },
  'api-reference': { title: <MetaTitle icon={Braces}>Login OpenAPI</MetaTitle> },
  errors: { title: <MetaTitle icon={AlertTriangle}>Errors &amp; troubleshooting</MetaTitle> },
  sdks: { title: <MetaTitle icon={Braces}>SDKs &amp; tools</MetaTitle> },

  '--reusable': { type: 'separator', title: 'Reusable Identity' },
  'user-token': { title: <MetaTitle icon={ShieldCheck}>APIs &amp; hosted flow</MetaTitle> },

  '--organizations': { type: 'separator', title: 'Organizations' },
  organizations: { title: <MetaTitle icon={Users}>Organizations &amp; teams</MetaTitle> },

  '--platform': { type: 'separator', title: 'Platform & Operations' },
  'create-project': { title: <MetaTitle icon={LayoutDashboard}>Developer Portal</MetaTitle> },
  'developer-accounts': { title: <MetaTitle icon={UserCog}>Accounts &amp; sign-in</MetaTitle> },
  testing: { title: <MetaTitle icon={FlaskConical}>Testing</MetaTitle> },
  customize: { title: <MetaTitle icon={Settings}>Customization</MetaTitle> },
  'data-and-trust': { title: <MetaTitle icon={ShieldCheck}>Security &amp; data</MetaTitle> },
  'security-trust': { title: <MetaTitle icon={Lock}>Trust Center</MetaTitle> },
  'data-retention': { title: <MetaTitle icon={Database}>Data retention</MetaTitle> },
  'data-residency': { title: <MetaTitle icon={Globe}>Data residency</MetaTitle> },
  'operations-sla': { title: <MetaTitle icon={Timer}>Operations &amp; SLA</MetaTitle> },
  'support-escalation': { title: <MetaTitle icon={LifeBuoy}>Support &amp; escalation</MetaTitle> },
  'disaster-recovery': { title: <MetaTitle icon={DatabaseBackup}>Disaster recovery</MetaTitle> },
  'rate-limits': { title: <MetaTitle icon={Gauge}>Rate limits</MetaTitle> },
  'api-key-lifecycle': { title: <MetaTitle icon={KeyRound}>API key lifecycle</MetaTitle> },
  'audit-logging': { title: <MetaTitle icon={ScrollText}>Audit logging</MetaTitle> },
  'security-disclosure': { title: <MetaTitle icon={ShieldAlert}>Security disclosure</MetaTitle> },
  'go-live': { title: <MetaTitle icon={Rocket}>Go-live checklist</MetaTitle> },

  '--releases': { type: 'separator', title: 'Releases' },
  changelog: { title: <MetaTitle icon={History}>Changelog</MetaTitle> },
  deprecations: { title: <MetaTitle icon={History}>Deprecations</MetaTitle> },

  // Merged into the stack-by-stack Quickstarts — page kept as a compatibility
  // redirect stub for inbound links + the llms.txt .md URL.
  'quick-start': { display: 'hidden' },
  // Deprecated marker-flow notice — kept for inbound links only.
  'login-sessions': { display: 'hidden' }
} satisfies MetaRecord
