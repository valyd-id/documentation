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

Steps their account has already passed are skipped automatically. Once done,
`id_verified: true` is readable forever via [the account reads](/docs/user-token/account).

Full walkthrough with portal screenshots: [Hosted for your users](/docs/user-token/hosted).
Need the raw document data in *your* system instead? That's the
[standalone product](/verifications/standalone) — no token, data returns to you.
