# License verification

> 🔑 **Auth:** API key + the user's `valyd_access_token` · ✅ Proves: an active professional license, verified at the source · 💾 Saved as a badge on their account

The license is checked against the issuing registry and matched against the account's **verified
legal name** — you don't collect or send a name at all:

```typescript
const result = await verify.standalone.credentialVerification({
  providerCode: "MD",              // provider / license type
  licenseState: "CA",
  licenseNumber: "A12345",
  valydAccessToken: accessToken,   // name comes from their verified account
});
// passed → a license badge saves to their Valyd ID
```

Next time, skip the check — [read the badge](/docs/user-token/account) with
`GET /oidc/licenses`.

`POST /api/v2/credential-verification` — providers, states, and required fields in the
[endpoint reference](/verifications/standalone/credential-verification).
Registry lookups can take 10–60s — set a generous client timeout.
