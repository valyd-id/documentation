import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true
})

/**
 * Old-site route aliases. The old SPA served every Verification-API section on
 * /verifications (with /verify/* aliases); each section is now its own page,
 * so old aliases 301 straight to the final page (no chains).
 */
const VERIFY_SECTIONS = [
  'quickstart',
  'console',
  'modes',
  'hosted',
  'standalone',
  'managed',
  'sdk',
  'webhooks',
  'statuses',
  'api-reference'
]

export default withNextra({
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/docs/overview', destination: '/docs', permanent: true },
      { source: '/verify', destination: '/verifications', permanent: true },
      { source: '/verify/intro', destination: '/verifications', permanent: true },
      { source: '/verifications/intro', destination: '/verifications', permanent: true },
      ...VERIFY_SECTIONS.map(s => ({
        source: `/verify/${s}`,
        destination: `/verifications/${s}`,
        permanent: true
      })),
      { source: '/verify/api', destination: '/verifications/api', permanent: true }
    ]
  }
})
