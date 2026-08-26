import type { MetaRecord } from 'nextra'
import { Bot, Braces, Code, KeyRound, Rocket } from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// AI & AGENTS tab — the machine-facing surface only (module-scoped sidebar). Login /
// Organizations live in the Docs tab; verification in the Verify tab.
export default {
  '--ai': { type: 'separator', title: 'AI & AGENTS' },
  index: { title: <MetaTitle icon={Bot}>Overview</MetaTitle> },
  'agent-guide': { title: <MetaTitle icon={Bot}>Agent integration guide</MetaTitle> },
  'machine-readable': { title: <MetaTitle icon={Braces}>Machine-readable docs</MetaTitle> },

  '--ai-mcp': { type: 'separator', title: 'MCP' },
  'mcp-setup': { title: <MetaTitle icon={Rocket}>Quickstart</MetaTitle> },
  'mcp-tools': { title: <MetaTitle icon={Code}>Tools</MetaTitle> },
  'mcp-auth': { title: <MetaTitle icon={KeyRound}>Authentication</MetaTitle> }
} satisfies MetaRecord
