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
  Signpost,
  Tag,
  Webhook,
  Workflow,
  Zap
} from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Goal-first, and it keeps the three concepts apart (see the IA audit):
//   DELIVERY  — who provides the capture UI: Hosted vs Direct API.
//   OWNERSHIP — Reusable Identity (proofs on the user's account) vs one-off checks.
//   COMMON    — types / decisions / webhooks apply to every mode (one canonical each).
// "For your users" heading removed; "Standalone checks" → Direct API Checks;
// "With the user's token" → Reusable Identity. Reusable-identity pages live in the
// docs route and are cross-linked here (one canonical each).
export default {
  '--overview': { type: 'separator', title: 'Overview' },
  index: { title: <MetaTitle icon={BookOpen}>Overview</MetaTitle> },
  choose: { title: <MetaTitle icon={Signpost}>Choose verification mode</MetaTitle>, href: '/docs/choose' },
  setup: { title: <MetaTitle icon={LayoutDashboard}>Setup</MetaTitle> },
  quickstart: { title: <MetaTitle icon={Zap}>Quickstart</MetaTitle> },

  '--hosted': { type: 'separator', title: 'Hosted Verification' },
  hosted: { title: <MetaTitle icon={Globe}>Hosted verification</MetaTitle> },
  workflows: { title: <MetaTitle icon={Workflow}>Workflows</MetaTitle> },

  // Direct API Checks — a self-grouping folder (Overview + per-check pages,
  // renamed from "Standalone checks"). Raw HTTP + errors live inside it.
  standalone: { title: <MetaTitle icon={Server}>Direct API Checks</MetaTitle> },

  '--reusable': { type: 'separator', title: 'Reusable Identity' },
  'read-proofs': { title: <MetaTitle icon={BookOpen}>Read existing proofs</MetaTitle>, href: '/docs/user-token/account' },
  managed: { title: <MetaTitle icon={KeyRound}>Verify &amp; save a new proof</MetaTitle> },
  'data-sharing': { title: <MetaTitle icon={ShieldCheck}>Data sharing &amp; consent</MetaTitle> },

  '--concepts': { type: 'separator', title: 'Common concepts' },
  types: { title: <MetaTitle icon={ScanFace}>Verification types</MetaTitle> },
  statuses: { title: <MetaTitle icon={ListChecks}>Decisions &amp; statuses</MetaTitle> },
  webhooks: { title: <MetaTitle icon={Webhook}>Webhooks</MetaTitle> },

  '--vref': { type: 'separator', title: 'Verification API Reference' },
  'api-reference': { title: <MetaTitle icon={Code}>Endpoints</MetaTitle> },
  sdk: { title: <MetaTitle icon={Package}>Node SDK</MetaTitle> },
  versioning: { title: <MetaTitle icon={Tag}>Versioning &amp; deprecation</MetaTitle> },
  api: { title: <MetaTitle icon={Braces}>Verification OpenAPI</MetaTitle> },
  console: { title: <MetaTitle icon={LayoutDashboard}>Developer Portal</MetaTitle> },

  // Superseded by /docs/choose — page kept for inbound links, hidden from nav.
  modes: { display: 'hidden' }
} satisfies MetaRecord
