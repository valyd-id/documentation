# Read the account

> 🔑 **Auth:** the user's Bearer `valyd_access_token` · 💸 Free — reads never cost a check · 🔒 Proofs and public data only, never PII

Three reads cover everything the account already holds:

| API | One call gets you |
| --- | --- |
| [`GET /oidc/userinfo`](/docs/endpoints#get-userinfo--get-user-profile) | Who they are — legal name, username, country, `id_verified` |
| [`GET /oidc/licenses`](/docs/endpoints#get-licenses--get-professional-licenses) | Professional licenses already verified on their account |
| [`GET /oidc/verifications`](/docs/endpoints#get-verifications--get-identity-verifications) | Every proof and badge — KYC done, age bands, license badges |

```typescript
const proofs = await valyd.auth.getVerifications(accessToken);
if (proofs.id_verified) {
  // KYC already done — you're finished. No check, no cost, no PII stored.
}
```

**This is the KYC-reuse story:** the user verified once — maybe in another app. You check the
status, you don't re-run it, and you never store personal data.

Raw identity attributes (DOB, document fields) are separate — the user approves them explicitly
via the [consent flow](/docs/request-data).

Something missing? Run the check from the sidebar — [face match](/docs/user-token/face-match),
[liveness](/docs/user-token/liveness), [license](/docs/user-token/license),
[age](/docs/user-token/age), [KYC](/docs/user-token/kyc) — or
[let us host them all](/docs/user-token/hosted).
