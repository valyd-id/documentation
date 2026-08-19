import type { MetaRecord } from 'nextra'
import {
  BookOpen,
  Braces,
  Code,
  Globe,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Package,
  ScanFace,
  Server,
  ShieldCheck,
  Tag,
  Webhook,
  Workflow,
  Zap
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// One user-centric journey: overview → setup → run a check for the user →
// hosted delivery → what runs → what comes back — then the separate
// standalone product (your data) at the bottom, then reference.
export default {
  '--overview': { type: 'separator', title: 'Overview' },
  index: { title: <MetaTitle icon={BookOpen}>Verification API</MetaTitle> },
  '--users': { type: 'separator', title: 'For your users' },
  setup: { title: <MetaTitle icon={LayoutDashboard}>Setup</MetaTitle> },
  quickstart: { title: <MetaTitle icon={Zap}>Quickstart</MetaTitle> },
  managed: { title: <MetaTitle icon={KeyRound}>Verify the user</MetaTitle> },
  hosted: { title: <MetaTitle icon={Globe}>Hosted delivery</MetaTitle> },
  types: { title: <MetaTitle icon={ScanFace}>Verification types</MetaTitle> },
  workflows: { title: <MetaTitle icon={Workflow}>Workflows</MetaTitle> },
  statuses: { title: <MetaTitle icon={ListChecks}>Decisions & statuses</MetaTitle> },
  webhooks: { title: <MetaTitle icon={Webhook}>Webhooks</MetaTitle> },
  '--standalone': { type: 'separator', title: 'Standalone checks (your data)' },
  standalone: { title: <MetaTitle icon={Server}>Standalone checks</MetaTitle> },
  'data-sharing': { title: <MetaTitle icon={ShieldCheck}>Data sharing</MetaTitle> },
  '--vref': { type: 'separator', title: 'Reference' },
  sdk: { title: <MetaTitle icon={Package}>Node SDK</MetaTitle> },
  console: { title: <MetaTitle icon={LayoutDashboard}>Developer Portal</MetaTitle> },
  // Superseded by /docs/choose — page kept for inbound links, hidden from nav.
  modes: { display: 'hidden' },
  versioning: { title: <MetaTitle icon={Tag}>Versioning & deprecation</MetaTitle> },
  'api-reference': { title: <MetaTitle icon={Code}>API reference</MetaTitle> },
  api: { title: <MetaTitle icon={Braces}>Full OpenAPI spec</MetaTitle> }
} satisfies MetaRecord
