import type { MetaRecord } from 'nextra'

// UNIQUE HUMAN API — the API-key product: is this a live, unique human?
//   • Liveness   → verify.standalone.antispoof (the antispoof page)
//   • Uniqueness → verify.standalone.faceUniqueness
// Every other file in this folder documents a capability that is NOT offered as a direct
// public API — those run only as checks inside a Reusable Verification workflow. Their pages
// are paused: hidden stubs kept reachable by URL for inbound links.
export default {
  index: { title: 'Overview' },
  antispoof: { title: 'Liveness' },
  'face-uniqueness': { title: 'Uniqueness' },

  // Paused APIs → capabilities documented as workflow checks (/verifications/types).
  liveness: { display: 'hidden' },
  'id-verification': { display: 'hidden' },
  'face-match': { display: 'hidden' },
  'age-verification': { display: 'hidden' },
  location: { display: 'hidden' },
  'credential-verification': { display: 'hidden' },
  'kyc-credential': { display: 'hidden' },

  // Retired — SDK-only product exposes no raw endpoints; errors live in the SDK/Errors docs.
  errors: { display: 'hidden' }
} satisfies MetaRecord
