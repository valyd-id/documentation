# Account-connected verification flow

> 📄 **This page moved.** Account-connected verification is now documented in one canonical
> place: **[Verify & save a new proof](/verifications/managed)**. This stub stays so old links
> keep working.

**Account-connected verification** chains two things: **Login with Valyd** gives your backend a
user access token, and the **Verification API** runs a check *with that token attached*. A passed
check becomes a durable **proof** on the user's Valyd account (pseudonym, `id_verified`, license
badges, age bands) — next time you just read it back instead of re-running the check. This is
Valyd's **Reusable Identity** model: the verified identity belongs to the user's account, reusable
across sessions and apps, and your system holds proofs rather than raw PII.

## Read the canonical guide

- **Verify & save a new proof** (full guide — steps, check endpoints, consent): [`/verifications/managed`](/verifications/managed)
- **Read existing proofs** back after login: [Reusable Identity APIs](/docs/user-token/account)
- The login half: [Authorization Code flow](/docs/flows/authorization-code)
- Reading proofs after login: [Login API Reference — Resource API](/docs/endpoints#resource-api--user-data)
- Where PII lives and what the account never returns: [Security & data](/docs/data-and-trust)
