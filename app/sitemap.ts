import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

const BASE = SITE.docsUrl

// HTML pages + agent-readable corpus, mirroring the old site's sitemap plus
// the pages that were missing from it.
const ROUTES = [
  '/',
  '/docs',
  '/docs/quick-start',
  '/docs/create-project',
  '/docs/developer-accounts',
  '/docs/login-sessions',
  '/docs/authentication',
  '/docs/oidc',
  '/docs/endpoints',
  '/docs/scopes',
  '/docs/request-data',
  '/docs/organizations',
  '/docs/errors',
  '/docs/changelog',
  '/docs/api-reference',
  '/verifications',
  '/verifications/quickstart',
  '/verifications/console',
  '/verifications/modes',
  '/verifications/hosted',
  '/verifications/standalone',
  '/verifications/standalone/id-verification',
  '/verifications/standalone/liveness',
  '/verifications/standalone/antispoof',
  '/verifications/standalone/face-uniqueness',
  '/verifications/standalone/location',
  '/verifications/standalone/face-match',
  '/verifications/standalone/age-verification',
  '/verifications/standalone/credential-verification',
  '/verifications/standalone/kyc-credential',
  '/verifications/standalone/http',
  '/verifications/standalone/errors',
  '/verifications/managed',
  '/verifications/sdk',
  '/verifications/webhooks',
  '/verifications/statuses',
  '/verifications/api-reference',
  '/verifications/api',
  '/verify/ship-hosted-kyc',
  '/verify/verify-license',
  '/mcp',
  '/agents',
  '/sandbox',
  '/evv',
  '/antispoof',
  '/llms.txt',
  '/llms-full.txt'
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(path => ({
    url: `${BASE}${path === '/' ? '' : path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7
  }))
}
