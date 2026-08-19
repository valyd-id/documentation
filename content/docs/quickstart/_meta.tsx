import type { MetaRecord } from 'nextra'

// Order matches the /docs/quickstarts picker: SDK lane first, then raw recipes.
export default {
  node: { title: 'Node.js (Express)' },
  nextjs: { title: 'Next.js (App Router)' },
  python: { title: 'Python (Flask)' },
  php: { title: 'PHP (Laravel)' },
  curl: { title: 'cURL (raw HTTP)' }
} satisfies MetaRecord
