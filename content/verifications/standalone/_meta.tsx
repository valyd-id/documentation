import type { MetaRecord } from 'nextra'

export default {
  index: { title: 'Overview' },
  'id-verification': { title: 'ID verification' },
  liveness: { title: 'Liveness' },
  antispoof: { title: 'Anti-spoof' },
  'face-uniqueness': { title: 'Face uniqueness' },
  location: { title: 'Location' },
  'face-match': { title: 'Face match' },
  'age-verification': { title: 'Age verification' },
  'credential-verification': { title: 'Credential verification' },
  'kyc-credential': { title: 'KYC + credential' },
  http: { title: 'Raw HTTP (cURL)' },
  errors: { title: 'Common errors' }
} satisfies MetaRecord
