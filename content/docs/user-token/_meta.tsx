import type { MetaRecord } from 'nextra'

// The "Reusable Identity" hub. Manifest lists only Overview + Read proofs here; every per-check
// page canonicalized to /verifications/standalone/* (thin hidden stubs kept for inbound links).
// kyc stays a full page (account-KYC is hosted-only, no standalone equivalent) but is out of nav.
export default {
  index: { title: 'Overview' },
  account: { title: 'Read proofs' },

  // Canonicalized → /verifications/standalone/* (or /verifications/hosted); hidden stubs.
  'face-match': { display: 'hidden' },
  liveness: { display: 'hidden' },
  license: { display: 'hidden' },
  age: { display: 'hidden' },
  hosted: { display: 'hidden' },
  // Full page, kept reachable by URL, out of nav (not a manifest item).
  kyc: { display: 'hidden' }
} satisfies MetaRecord
