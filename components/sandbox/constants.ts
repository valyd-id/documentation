/**
 * Sandbox ("Try the APIs") configuration.
 *
 * NEXT_PUBLIC_* vars are inlined at build time; the defaults are the
 * development (valyd.work) hosts — the same fallbacks the old Vite SPA used.
 * The client id/secret are published shared TEST identifiers, not secrets.
 */

const DOCS_BASE_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL ?? 'https://docs.valyd.work'

export const SANDBOX_BASE_URL =
  process.env.NEXT_PUBLIC_SANDBOX_BASE_URL ?? 'https://idp.valyd.work'
export const SANDBOX_CLIENT_ID =
  process.env.NEXT_PUBLIC_SANDBOX_CLIENT_ID ?? 'sandbox_pollus_test'
export const SANDBOX_CLIENT_SECRET =
  process.env.NEXT_PUBLIC_SANDBOX_CLIENT_SECRET ?? 'sk_test_pollus_xxxxxxxxxxxxxxxx'
export const SANDBOX_REDIRECT_URI = `${DOCS_BASE_URL}/sandbox/callback`

export const DEV_PORTAL_URL = process.env.NEXT_PUBLIC_DEV_PORTAL_URL ?? 'https://dev.valyd.work'

export const AVAILABLE_SCOPES = [
  'profile',
  'verifications',
  'doctor_license',
  'zkp',
  'mcp'
] as const

export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  profile: 'Basic user profile claims — name, email, photo, and ID verification status.',
  verifications: 'Identity verification data, including ID and face-match results.',
  doctor_license: 'Medical/nursing license details for verified healthcare practitioners.',
  zkp:
    'Zero-knowledge proof age checks (is_18 / is_21 / is_25) that confirm an age threshold ' +
    "without revealing the user's birth date.",
  mcp: 'Model Context Protocol endpoints for AI agents to access authorized identity data.'
}

export const DEFAULT_SCOPES = new Set<string>(['profile', 'verifications'])

export type DemoUser = 'simple' | 'nurse' | 'doctor'

export const DEMO_USERS: { id: DemoUser; label: string; desc: string }[] = [
  { id: 'simple', label: 'Simple', desc: 'no licenses' },
  { id: 'nurse', label: 'Nurse', desc: 'verified nursing license' },
  { id: 'doctor', label: 'Doctor', desc: 'verified medical license' }
]
