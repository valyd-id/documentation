import type { MetaRecord } from 'nextra'

// Verify Fresh — the ONLY non-account direct checks (liveness & uniqueness family). Every other
// check (ID/KYC, face match, age, location, credential, KYC+credential) now runs through Managed
// by Valyd (hosted, all checks); those pages stay reachable as hidden redirect stubs.
export default {
  index: { title: 'Overview' },
  liveness: { title: 'Liveness' },
  antispoof: { title: 'Anti-spoof' },
  'face-uniqueness': { title: 'Face uniqueness' },
  http: { title: 'Raw HTTP (cURL)' },
  errors: { title: 'Common errors' },

  // Removed from self-serve — hidden from nav, reachable by URL (redirect stubs → Managed by Valyd).
  'id-verification': { display: 'hidden' },
  'face-match': { display: 'hidden' },
  'age-verification': { display: 'hidden' },
  location: { display: 'hidden' },
  'credential-verification': { display: 'hidden' },
  'kyc-credential': { display: 'hidden' }
} satisfies MetaRecord
