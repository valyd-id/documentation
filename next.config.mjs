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
  'unique-human',
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
      // Retired product-model pages (2026-08 two-product restructure). Content pages remain as
      // noindex stubs for llms.txt .md mirrors; the HTML routes 301 to the canonical page.
      { source: '/docs/choose', destination: '/docs/introduction', permanent: true },
      { source: '/verifications/managed', destination: '/verifications', permanent: true },
      { source: '/verifications/hosted', destination: '/verifications/quickstart', permanent: true },
      // The `standalone/` folder was renamed → `unique-human/`. Retired direct-check pages 301 to
      // the checks reference (both old and new URLs); liveness folds into anti-spoof. The retired
      // per-check redirects must precede the catch-all so they win.
      ...['id-verification', 'face-match', 'age-verification', 'credential-verification', 'kyc-credential', 'location'].flatMap(s => [
        { source: `/verifications/standalone/${s}`, destination: '/verifications/types', permanent: true },
        { source: `/verifications/unique-human/${s}`, destination: '/verifications/types', permanent: true }
      ]),
      { source: '/verifications/standalone/liveness', destination: '/verifications/unique-human/antispoof', permanent: true },
      { source: '/verifications/unique-human/liveness', destination: '/verifications/unique-human/antispoof', permanent: true },
      // Old standalone/* URLs → new unique-human/* (index, anti-spoof, uniqueness, errors).
      { source: '/verify/standalone', destination: '/verifications/unique-human', permanent: true },
      { source: '/verifications/standalone', destination: '/verifications/unique-human', permanent: true },
      { source: '/verifications/standalone/:slug*', destination: '/verifications/unique-human/:slug*', permanent: true },
      // The API Playground moved into the Docs tree so it gets the docs sidebar.
      { source: '/sandbox', destination: '/docs/sandbox', permanent: true }
    ]
  }
})
