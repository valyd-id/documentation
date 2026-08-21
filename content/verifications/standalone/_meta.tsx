import type { MetaRecord } from 'nextra'

// Order matches the Direct API Checks group in the IA audit:
// overview, then the per-check pages, then raw HTTP + errors.
export default {
  index: { title: 'Overview' },
  'id-verification': { title: 'ID verification' },
  liveness: { title: 'Liveness' },
  antispoof: { title: 'Anti-spoof' },
  'face-match': { title: 'Face match' },
  'face-uniqueness': { title: 'Face uniqueness' },
  'age-verification': { title: 'Age verification' },
  location: { title: 'Location' },
  'credential-verification': { title: 'Credential verification' },
  'kyc-credential': { title: 'KYC + credential' },
  http: { title: 'Raw HTTP (cURL)' },
  errors: { title: 'Common errors' }
} satisfies MetaRecord
