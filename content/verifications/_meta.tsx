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
  Server,
  Shuffle,
  Webhook,
  Zap
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Order, labels, and icons mirror the old Verification API docs sidebar. The
// old single-page ?mode= switcher is now separate pages: hosted / standalone
// (Core APIs) / managed.
export default {
  index: { title: <MetaTitle icon={BookOpen}>Introduction</MetaTitle> },
  quickstart: { title: <MetaTitle icon={Zap}>Quickstart</MetaTitle> },
  console: { title: <MetaTitle icon={LayoutDashboard}>Developer Portal</MetaTitle> },
  modes: { title: <MetaTitle icon={Shuffle}>Choose your integration</MetaTitle> },
  hosted: { title: <MetaTitle icon={Globe}>Hosted Verification</MetaTitle> },
  standalone: { title: <MetaTitle icon={Server}>Core APIs</MetaTitle> },
  managed: { title: <MetaTitle icon={KeyRound}>Managed by Valyd</MetaTitle> },
  sdk: { title: <MetaTitle icon={Package}>Node SDK</MetaTitle> },
  webhooks: { title: <MetaTitle icon={Webhook}>Webhooks</MetaTitle> },
  statuses: { title: <MetaTitle icon={ListChecks}>Statuses</MetaTitle> },
  'api-reference': { title: <MetaTitle icon={Code}>API reference</MetaTitle> },
  api: { title: <MetaTitle icon={Braces}>Full OpenAPI spec</MetaTitle> }
} satisfies MetaRecord
