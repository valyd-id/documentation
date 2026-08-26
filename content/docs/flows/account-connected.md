# Account-connected verification flow

> 📄 **This page moved.** This journey is now documented in one canonical place:
> **[Reusable Verification](/verifications)**. This stub stays so old links keep working.

**Reusable Verification** chains two things: **Connect with Valyd** gives your backend a user
access token, and a configured **workflow** runs any checks still missing *with that token
attached*. A passed check becomes a durable **proof** on the user's Valyd ID (pseudonym,
`id_verified`, license badges, age bands) — next time you just read it back instead of re-running
the check. The verified identity belongs to the user's account, reusable across sessions and
apps, and your system holds proofs rather than raw PII.

## Read the canonical guide

- **Reusable Verification** (the full journey — Connect, read, verify, decide): [`/verifications`](/verifications)
- **Read existing proofs** back after Connect: [Account APIs](/docs/user-token/account)
- The Connect half: [Authorization Code flow](/docs/flows/authorization-code)
- Reading proofs after Connect: [Account API — Resource API](/docs/endpoints#resource-api--user-data)
- Where PII lives and what the account never returns: [Security & data](/docs/data-and-trust)
