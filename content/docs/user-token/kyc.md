# KYC / ID verification

> 🔑 **Auth:** the user's `valyd_access_token`, on a verification session · ✅ Proves: government-ID identity → `id_verified: true` · 🔒 Valyd's verification page only

Account-connected KYC runs **only on Valyd's verification page** — the user's identity data is
encrypted with a key that lives on their device and Valyd's own surface, so an API upload from
your backend can't fill their vault. Valyd's verification page can; your server never touches
the documents:

```typescript
const session = await verify.sessions.create({
  workflowId,                      // a workflow containing the KYC check
  valydAccessToken: accessToken,
  redirectUrl: "https://yourapp.com/verified",
});
// → send the user to session.url — ID scan, liveness, face match all happen there
// → webhook: id_verified + proofs — the documents stay with Valyd, encrypted
```

**Simplest handoff.** If all you need is "make this connected user complete KYC," gate on the proof
they already hold, then run a workflow session with their token — Valyd hosts the KYC page and
brings the user back when they're done:

```typescript
// Gate first: only run KYC if it isn't already on the account
const verifications = await valyd.auth.getVerifications(accessToken);
if (!verifications.id_verified) {
  const session = await verify.sessions.create({
    workflowId,                      // a workflow that includes the ID / KYC check
    valydAccessToken: accessToken,   // ties the run to the connected user
    redirectUrl: "https://yourapp.com/verified",
  });
  return res.redirect(session.url);  // user completes KYC on Valyd, then returns
}
```

> **These handoffs are the only way to establish `id_verified`.** ID/KYC runs exclusively as a
> **Reusable Verification** workflow check on Valyd's verification page — there is no direct
> public ID/KYC API. The raw document stays encrypted with Valyd; your app receives the reusable
> `id_verified` proof, never the raw fields.

Steps their account has already passed are skipped automatically. Once done,
`id_verified: true` is readable forever via [Read verified data](/docs/user-token/account).

Full walkthrough: [Run a verification](/verifications/quickstart) · [Reusable Verification](/verifications).
