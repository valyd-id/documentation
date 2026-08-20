import type { MetaRecord } from 'nextra'
import { BookOpen, Bot, KeyRound, Plug, Vault } from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Journey order: what Valyd offers agents → connect the MCP server →
// what the tools are → how auth works → the no-MCP integration path.
export default {
  '--overview': { type: 'separator', title: 'Overview' },
  index: { title: <MetaTitle icon={BookOpen}>Valyd for AI Agents</MetaTitle> },
  '--mcp': { type: 'separator', title: 'MCP server' },
  'mcp-setup': { title: <MetaTitle icon={Plug}>Quick start</MetaTitle> },
  'mcp-tools': { title: <MetaTitle icon={Bot}>Tool reference</MetaTitle> },
  'mcp-auth': { title: <MetaTitle icon={KeyRound}>Authentication</MetaTitle> },
  '--direct': { type: 'separator', title: 'Direct integration' },
  'agent-guide': { title: <MetaTitle icon={Vault}>Agent guide (no MCP)</MetaTitle> }
} satisfies MetaRecord
