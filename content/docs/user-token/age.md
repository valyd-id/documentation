# Age check

> 🔑 **Auth:** API key + the user's `valyd_access_token` · ✅ Proves: an age band — never the date of birth · 💾 Bands save to their account

Answers "is this person over N?" from the account's **KYC-verified** date of birth — the DOB
itself never leaves Valyd:

```typescript
const result = await verify.standalone.ageVerification({
  bands: ["is_18_plus", "is_21_plus"],
  valydAccessToken: accessToken,   // uses their verified DOB
});
// result.data.bands: { is_18_plus: { satisfied: true }, is_21_plus: { satisfied: true } }
```

Read `satisfied` on each band (`verified` is a deprecated alias). Bands:
`is_16_plus` · `is_18_plus` · `is_21_plus` · `is_30_plus` · `is_65_plus`.

`POST /api/v2/age-verification` — full shape in the
[endpoint reference](/verifications/standalone/age-verification).

Once satisfied, the bands appear in [`GET /oidc/verifications`](/docs/user-token/account) —
no re-check needed.
