import type { MetaRecord } from 'nextra'
import {
  Sparkles,
  Settings,
  AlertTriangle,
  Braces,
  BookOpen,
  Code,
  Fingerprint,
  FlaskConical,
  History,
  KeyRound,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Signpost,
  Tags,
  UserCog,
  Users
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// One journey, top to bottom: get started (intro → choose) → add login →
// full example → test it → plug in your own library → reference. Setup/admin
// pages follow, then data & trust and the go-live checklist; deprecated or
// merged pages stay reachable by URL but are hidden from the sidebar.
export default {
  '--get-started': { type: 'separator', title: 'Get started' },
  introduction: { title: <MetaTitle icon={BookOpen}>Introduction</MetaTitle> },
  'how-valyd-works': { title: <MetaTitle icon={Sparkles}>How Valyd works</MetaTitle> },
  choose: { title: <MetaTitle icon={Signpost}>Choose your integration</MetaTitle> },
  quickstarts: { title: <MetaTitle icon={Rocket}>Quickstarts</MetaTitle> },
  quickstart: { title: 'Quickstart guides' },
  '--login': { type: 'separator', title: 'Sign in with Valyd' },
  index: { title: <MetaTitle icon={KeyRound}>Login with Valyd</MetaTitle> },
  'quick-start': { title: <MetaTitle icon={Rocket}>Complete example</MetaTitle> },
  oidc: { title: <MetaTitle icon={Fingerprint}>Use your own OIDC library</MetaTitle> },
  authentication: { title: <MetaTitle icon={KeyRound}>Raw HTTP flow</MetaTitle> },
  scopes: { title: <MetaTitle icon={Tags}>Scopes</MetaTitle> },
  '--concepts': { type: 'separator', title: 'Concepts' },
  flows: { title: 'Flows' },
  tokens: { title: <MetaTitle icon={KeyRound}>Tokens</MetaTitle> },
  sessions: { title: <MetaTitle icon={History}>Sessions</MetaTitle> },
  '--ship': { type: 'separator', title: 'Test & go live' },
  testing: { title: <MetaTitle icon={FlaskConical}>Testing</MetaTitle> },
  'data-and-trust': { title: <MetaTitle icon={ShieldCheck}>Data & trust</MetaTitle> },
  'go-live': { title: <MetaTitle icon={Rocket}>Go-live checklist</MetaTitle> },
  '--reference': { type: 'separator', title: 'Reference' },
  endpoints: { title: <MetaTitle icon={Code}>API reference</MetaTitle> },
  'api-reference': { title: <MetaTitle icon={Braces}>Full OpenAPI spec</MetaTitle> },
  errors: { title: <MetaTitle icon={AlertTriangle}>Errors & troubleshooting</MetaTitle> },
  sdks: { title: <MetaTitle icon={Braces}>SDKs & tools</MetaTitle> },
  deprecations: { title: <MetaTitle icon={History}>Deprecations</MetaTitle> },
  '--platform': { type: 'separator', title: 'Platform' },
  'create-project': { title: <MetaTitle icon={LayoutDashboard}>Dev portal setup</MetaTitle> },
  'developer-accounts': { title: <MetaTitle icon={UserCog}>Accounts & sign-in</MetaTitle> },
  organizations: { title: <MetaTitle icon={Users}>Organizations & teams</MetaTitle> },
  customize: { title: <MetaTitle icon={Settings}>Customization</MetaTitle> },
  changelog: { title: <MetaTitle icon={History}>Changelog</MetaTitle> },
  // Merged into the API reference (consent section) — page kept for inbound links.
  'request-data': { display: 'hidden' },
  // Deprecated marker-flow notice — kept for inbound links only.
  'login-sessions': { display: 'hidden' }
} satisfies MetaRecord
