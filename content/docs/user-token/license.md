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

## Discover state → license type first

Don't hard-code the codes — list them, then verify (the name still comes from the account):

```typescript
const states = await verify.credentials.states();        // → pick stateCode, e.g. "CT"
const types  = await verify.credentials.types("CT");      // → pick a type.code = the license type

await verify.standalone.credentialVerification({
  licenseState: "CT",              // stateCode
  licenseType: "ct_type_120",      // the type.code from credentials.types — the license type
  licenseNumber: "A12345",
  valydAccessToken: accessToken,   // name comes from their verified account
  // providerCode: "elicense_ct_gov",  // optional — pin a specific registry
});
```

Full discovery + parameter detail:
[Credential Verification reference](/verifications/standalone/credential-verification).
Registry lookups can take 10–60s — set a generous client timeout.
