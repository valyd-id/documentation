// Environment-driven base URLs. One set of sources deploys to every
// environment by setting these vars at build time:
//   dev      *.valyd.work   (defaults below)
//   testing  *.valyd.vip
//   prod     *.valyd.id
//
// NEXT_PUBLIC_DOCS_URL  this docs site         (sitemap, canonical links)
// NEXT_PUBLIC_IDP_URL   API host (idp)         (shown in examples)
// NEXT_PUBLIC_DEV_URL   developer portal       (sign-up / credentials)
// NEXT_PUBLIC_MCP_URL   MCP server (agents)    (shown in MCP setup / auth)
const strip = (u: string) => u.replace(/\/+$/, '')

export const SITE = {
  docsUrl: strip(process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.valyd.work'),
  idpUrl: strip(process.env.NEXT_PUBLIC_IDP_URL || 'https://idp.valyd.work'),
  devUrl: strip(process.env.NEXT_PUBLIC_DEV_URL || 'https://dev.valyd.work'),
  mcpUrl: strip(process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.valyd.work')
}
