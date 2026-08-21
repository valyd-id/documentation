import nextra from 'nextra'
import remarkHosts from './lib/remark-hosts.mjs'

const withNextra = nextra({
  defaultShowCopyCode: true,
  // Rewrite canonical *.valyd.work hosts in rendered pages to the per-env hosts
  // (dev=.work, testing=.vip, prod=.id) from NEXT_PUBLIC_* — matches the corpus.
  mdxOptions: {
    remarkPlugins: [remarkHosts]
  }
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
  // Lint/type errors must not block a production deploy build. Next 15 runs ESLint
  // during `next build` and fails on pre-existing warnings (a-vs-Link, set-state-in-effect);
  // keep the build about shipping, run lint/typecheck separately in CI.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
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
      { source: '/verify/api', destination: '/verifications/api', permanent: true },
      // The API Playground moved into the Docs tree so it gets the docs sidebar.
      { source: '/sandbox', destination: '/docs/sandbox', permanent: true }
    ]
  }
})
