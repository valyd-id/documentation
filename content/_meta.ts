import type { MetaRecord } from 'nextra'

export default {
  index: {
    title: 'Home',
    type: 'page',
    display: 'hidden',
    theme: {
      layout: 'full',
      sidebar: false,
      toc: false,
      breadcrumb: false,
      pagination: false,
      timestamp: false,
      copyPage: false
    }
  },
  docs: { title: 'Valyd ID', type: 'page' },
  verifications: { title: 'Verification APIs', type: 'page' },
  mcp: { title: 'MCP', type: 'page' },
  agents: { title: 'For AI agents', type: 'page' },
  // Interactive playground lives at app/sandbox (not in content/)
  sandbox: { title: 'Try the APIs', type: 'page', href: '/sandbox' },
  // Recipe + demo pages keep their old URLs but stay out of the navbar;
  // they are linked from within the docs.
  verify: { display: 'hidden' },
  evv: { display: 'hidden' },
  antispoof: { display: 'hidden' }
} satisfies MetaRecord
