import type { MetaRecord } from 'nextra'

// Login flows only. The two verification-flow pages (account-connected,
// hosted-verification) duplicated the canonical /verifications/* product pages;
// they are now short concept stubs that redirect there, kept reachable by URL
// (inbound links + llms.txt .md mirrors) but hidden from the sidebar.
export default {
  'authorization-code': { title: 'Authorization Code' },
  button: { title: 'Sign-in button' },
  refresh: { title: 'Refresh & logout' },
  'account-connected': { display: 'hidden' },
  'hosted-verification': { display: 'hidden' }
} satisfies MetaRecord
