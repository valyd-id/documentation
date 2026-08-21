# KYC / ID verification

> 🔑 **Auth:** the user's `valyd_access_token`, on a **hosted** session · ✅ Proves: government-ID identity → `id_verified: true` · 🔒 Hosted page only

Account-connected KYC runs **only on the hosted page** — the user's identity data is encrypted
with a key that lives on their device and Valyd's own surface, so an API upload from your
backend can't fill their vault. The hosted page can; your server never touches the documents:

```typescript
const session = await verify.sessions.create({
  workflowId,                      // a workflow containing the KYC check
  valydAccessToken: accessToken,
  redirectUrl: "https://yourapp.com/verified",
});
// → send the user to session.url — ID scan, liveness, face match all happen there
// → webhook: id_verified + proofs — the documents stay with Valyd, encrypted
```

**Simplest handoff.** If all you need is "make this signed-in user complete KYC," skip building a
session and use the redirect helper — it returns a URL to Valyd's account KYC page and brings the
user back when they're done:

```typescript
// Gate first: only send them if they aren't already verified
const verifications = await valyd.auth.getVerifications(accessToken);
if (valyd.verify.kyc.isRequired(verifications)) {
  const url = valyd.verify.kyc.redirectUrl({ returnTo: "https://yourapp.com/verified" });
  return res.redirect(url);          // user completes KYC on Valyd, then returns
}
```

> **Reading vs performing.** In account mode the direct
> [`id-verification`](/verifications/standalone/id-verification) check only **reads back** the
> account's existing `id_verified` status — it cannot *write* the vault. To actually establish
> `id_verified: true`, use one of the hosted handoffs above. (Running ID/KYC on data **you** supply,
> with the result returned to you, is the separate [Direct API](/verifications/standalone) product.)

Steps their account has already passed are skipped automatically. Once done,
`id_verified: true` is readable forever via [the account reads](/docs/user-token/account).

Full walkthrough with portal screenshots: [Hosted for your users](/docs/user-token/hosted).
Need the raw document data in *your* system instead? That's the
[standalone product](/verifications/standalone) — no token, data returns to you.
