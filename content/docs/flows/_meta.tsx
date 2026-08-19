import type { MetaRecord } from 'nextra'

// Login flows first, then verification flow-views, then token upkeep.
export default {
  'authorization-code': { title: 'Authorization Code' },
  button: { title: 'Sign-in button' },
  'account-connected': { title: 'Account-connected verification' },
  'hosted-verification': { title: 'Hosted verification' },
  refresh: { title: 'Refresh & logout' }
} satisfies MetaRecord
