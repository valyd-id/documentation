import type { MetaRecord } from 'nextra'
import { BookOpen, Bot, KeyRound, Plug, Vault } from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Surface the agent guide (it already models login vs delivery vs ownership as
// three separate concepts) right under the overview, then the machine-readable
// corpus, the MCP server, and the capability manifest.
export default {
  '--overview': { type: 'separator', title: 'Overview' },
  index: { title: <MetaTitle icon={BookOpen}>Valyd for AI Agents</MetaTitle> },
  'agent-guide': { title: <MetaTitle icon={Vault}>Agent integration guide</MetaTitle> },
  resources: { title: <MetaTitle icon={BookOpen}>Machine-readable docs</MetaTitle>, href: '/llms.txt' },
  '--mcp': { type: 'separator', title: 'MCP server' },
  'mcp-setup': { title: <MetaTitle icon={Plug}>Quick start</MetaTitle> },
  'mcp-tools': { title: <MetaTitle icon={Bot}>Tool reference</MetaTitle> },
  'mcp-auth': { title: <MetaTitle icon={KeyRound}>Authentication</MetaTitle> },
  capabilities: { title: <MetaTitle icon={Bot}>Capability manifest</MetaTitle>, href: '/agent/capabilities.json' }
} satisfies MetaRecord
