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
  docs: { title: 'Docs', type: 'page', href: '/docs/introduction' },
  verifications: { title: 'Verify', type: 'page' },
  ai: { title: 'AI & Agents', type: 'page' },
  // Old single-page entries stay reachable by URL but out of the navbar —
  // superseded by the AI & Agents section.
  mcp: { display: 'hidden' },
  agents: { display: 'hidden' },
  // Interactive playground lives at app/sandbox (not in content/)
  sandbox: { title: 'API Playground', type: 'page', href: '/sandbox' },
  // Recipe + demo pages keep their old URLs but stay out of the navbar;
  // they are linked from within the docs.
  verify: { display: 'hidden' },
  evv: { display: 'hidden' },
  antispoof: { display: 'hidden' }
} satisfies MetaRecord
