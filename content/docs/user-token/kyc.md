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

> **The hosted handoffs are the only way to establish `id_verified`.** ID/KYC now runs exclusively
> through **Managed by Valyd** (the hosted handoffs above) — there is no self-serve direct ID/KYC
> call. The raw document stays encrypted with Valyd; your app receives the reusable `id_verified`
> proof, never the raw fields.

Steps their account has already passed are skipped automatically. Once done,
`id_verified: true` is readable forever via [the account reads](/docs/user-token/account).

Full walkthrough: [Hosted verification](/verifications/hosted) · [Managed by Valyd](/verifications/managed).
