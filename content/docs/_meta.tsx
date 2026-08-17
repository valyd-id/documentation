import type { MetaRecord } from 'nextra'
import {
  AlertTriangle,
  Braces,
  BookOpen,
  Code,
  Database,
  Fingerprint,
  History,
  KeyRound,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Tags,
  UserCog,
  Users
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Order and labels mirror the old docs sidebar; icons follow the old
// sidebar's lucide choices where it had them.
export default {
  index: { title: <MetaTitle icon={BookOpen}>Introduction</MetaTitle> },
  'quick-start': { title: <MetaTitle icon={Rocket}>Quick start</MetaTitle> },
  'login-sessions': { title: <MetaTitle icon={ShieldCheck}>Login sessions (CSRF)</MetaTitle> },
  authentication: { title: <MetaTitle icon={KeyRound}>OAuth / TPSSO flow</MetaTitle> },
  scopes: { title: <MetaTitle icon={Tags}>Scopes</MetaTitle> },
  'request-data': { title: <MetaTitle icon={Database}>Request user data</MetaTitle> },
  endpoints: { title: <MetaTitle icon={Code}>API reference</MetaTitle> },
  'api-reference': { title: <MetaTitle icon={Braces}>Full OpenAPI spec</MetaTitle> },
  errors: { title: <MetaTitle icon={AlertTriangle}>Errors & troubleshooting</MetaTitle> },
  changelog: { title: <MetaTitle icon={History}>Changelog</MetaTitle> },
  'create-project': { title: <MetaTitle icon={LayoutDashboard}>Dev portal setup</MetaTitle> },
  'developer-accounts': { title: <MetaTitle icon={UserCog}>Accounts & sign-in</MetaTitle> },
  organizations: { title: <MetaTitle icon={Users}>Organizations & teams</MetaTitle> },
  oidc: { title: <MetaTitle icon={Fingerprint}>OIDC Integration</MetaTitle> }
} satisfies MetaRecord
