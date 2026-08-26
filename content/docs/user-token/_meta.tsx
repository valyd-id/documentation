import type { MetaRecord } from 'nextra'

// "Read verified data" — what a connected user's token lets you read. Surfaced in the Verify tab
// under Reusable Verification. Per-check pages are retired stubs (capabilities are workflow
// checks now — /verifications/types); kyc stays a full page reachable by URL, out of nav.
export default {
  index: { title: 'Overview' },
  account: { title: 'Read verified data' },

  // Retired stubs — kept reachable by URL (inbound links + llms.txt .md mirrors).
  'face-match': { display: 'hidden' },
  liveness: { display: 'hidden' },
  license: { display: 'hidden' },
  age: { display: 'hidden' },
  hosted: { display: 'hidden' },
  // Full page, kept reachable by URL, out of nav (not a manifest item).
  kyc: { display: 'hidden' }
} satisfies MetaRecord
