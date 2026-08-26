import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'
import { canonicalRoutes, SECONDARY } from '../docs-manifest.mjs'

const BASE = SITE.docsUrl

// Derived from the nav manifest (canonical pages only — stubs/retired routes excluded, they 301),
// plus the reachable pages that live outside the sidebar.
const EXTRA = [
  '/',
  '/verify/ship-hosted-kyc',
  '/verify/verify-license',
  '/mcp',
  '/agents',
  '/evv',
  '/antispoof',
  '/llms.txt',
  '/llms-full.txt'
]

const ROUTES: string[] = [
  ...new Set<string>([
    ...EXTRA,
    ...canonicalRoutes(),
    ...(SECONDARY as { route: string }[]).map(s => s.route)
  ])
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(path => ({
    url: `${BASE}${path === '/' ? '' : path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7
  }))
}
