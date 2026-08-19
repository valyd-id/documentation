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
  Tag,
  Webhook,
  Workflow,
  Zap
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Journey order: overview → quickstart → the two integration surfaces →
// what runs (types/workflows) → what comes back (decisions, webhooks) →
// reusable identity → tooling and reference.
export default {
  '--overview': { type: 'separator', title: 'Overview' },
  index: { title: <MetaTitle icon={BookOpen}>Verification API</MetaTitle> },
  quickstart: { title: <MetaTitle icon={Zap}>Quickstart (API key)</MetaTitle> },
  '--account': { type: 'separator', title: 'With the user\'s account' },
  managed: { title: <MetaTitle icon={KeyRound}>Reusable identity</MetaTitle> },
  '--build': { type: 'separator', title: 'Build' },
  hosted: { title: <MetaTitle icon={Globe}>Hosted flow</MetaTitle> },
  standalone: { title: <MetaTitle icon={Server}>Core API</MetaTitle> },
  types: { title: <MetaTitle icon={ScanFace}>Verification types</MetaTitle> },
  workflows: { title: <MetaTitle icon={Workflow}>Workflows</MetaTitle> },
  '--results': { type: 'separator', title: 'Results' },
  statuses: { title: <MetaTitle icon={ListChecks}>Decisions & statuses</MetaTitle> },
  webhooks: { title: <MetaTitle icon={Webhook}>Webhooks</MetaTitle> },
  '--vref': { type: 'separator', title: 'Reference' },
  sdk: { title: <MetaTitle icon={Package}>Node SDK</MetaTitle> },
  console: { title: <MetaTitle icon={LayoutDashboard}>Developer Portal</MetaTitle> },
  // Superseded by /docs/choose — page kept for inbound links, hidden from nav.
  modes: { display: 'hidden' },
  versioning: { title: <MetaTitle icon={Tag}>Versioning & deprecation</MetaTitle> },
  'api-reference': { title: <MetaTitle icon={Code}>API reference</MetaTitle> },
  api: { title: <MetaTitle icon={Braces}>Full OpenAPI spec</MetaTitle> }
} satisfies MetaRecord
