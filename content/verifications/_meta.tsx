import type { MetaRecord } from 'nextra'
import {
  BookOpen,
  Braces,
  Fingerprint,
  History,
  LogIn,
  Rocket,
  ScanFace,
  Settings,
  ShieldCheck,
  Tags,
  Zap
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// VERIFY tab — the two public products (module-scoped sidebar):
//   • Unique Human API      → API-key calls: is this a live, unique human?
//   • Reusable Verification → Connect with Valyd (OIDC) + read verified data + workflows.
// Connect/Organizations plumbing lives in the Docs tab; agents in the AI tab.
export default {
  '--unique-human': { type: 'separator', title: 'UNIQUE HUMAN API' },
  standalone: { title: <MetaTitle icon={Zap}>Unique Human</MetaTitle> },

  '--reusable': { type: 'separator', title: 'REUSABLE VERIFICATION' },
  index: { title: <MetaTitle icon={ShieldCheck}>Overview</MetaTitle> },
  'r-connect': { title: <MetaTitle icon={LogIn}>Connect with Valyd</MetaTitle>, href: '/docs/authentication' },
  'r-readdata': { title: <MetaTitle icon={BookOpen}>Read verified data</MetaTitle>, href: '/docs/user-token/account' },
  'data-sharing': { title: <MetaTitle icon={ShieldCheck}>Consent &amp; data access</MetaTitle> },
  '--r-workflows': { type: 'separator', title: 'Workflows' },
  workflows: { title: <MetaTitle icon={Braces}>Overview</MetaTitle> },
  setup: { title: <MetaTitle icon={Settings}>Create a workflow</MetaTitle> },
  quickstart: { title: <MetaTitle icon={Rocket}>Run a verification</MetaTitle> },
  types: { title: <MetaTitle icon={Tags}>Checks reference</MetaTitle> },
  '--r-results': { type: 'separator', title: 'Results' },
  statuses: { title: <MetaTitle icon={ShieldCheck}>Results &amp; decisions</MetaTitle> },
  'session-lifecycle': { title: <MetaTitle icon={History}>Session lifecycle</MetaTitle> },
  webhooks: { title: <MetaTitle icon={Braces}>Webhooks</MetaTitle> },

  '--reference': { type: 'separator', title: 'REFERENCE' },
  sdk: { title: <MetaTitle icon={Braces}>Node SDK</MetaTitle> },
  // Hidden from nav for now — kept reachable by URL for inbound links.
  versioning: { display: 'hidden' },

  // Retired concept pages — thin stubs kept reachable by URL (inbound links), out of nav.
  managed: { display: 'hidden' },
  hosted: { display: 'hidden' },
  // Hidden from nav — SDK-only product: the raw endpoint/OpenAPI surface is not exposed.
  'api-reference': { display: 'hidden' },
  api: { display: 'hidden' },
  console: { display: 'hidden' },
  modes: { display: 'hidden' }
} satisfies MetaRecord
