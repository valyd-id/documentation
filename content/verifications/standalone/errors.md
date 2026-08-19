# Common errors

Over HTTP, failures return the envelope `{ success: false, error: { code, message } }` with the matching HTTP status:

- `401` — invalid or missing API key.
- `400` — validation error (missing field, bad image, unknown provider).
- `404` — unknown state or provider.
- `429` — rate limited.
- `5xx` — upstream registry or internal error.

In the SDK, the same failures throw `ValydVerifyError` with `{ code, status, message }`. Credential registry lookups can take **10–60 seconds** — configure a generous client timeout.

```javascript
import { VerifyClient, ValydVerifyError, readImage } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey: process.env.VALYD_API_KEY,
  timeoutMs: 90_000, // registry lookups can be slow
});

try {
  const { check } = await verify.standalone.credentialVerification({
    firstName: "Jane", lastName: "Doe",
    providerCode: "MD", licenseState: "CA", licenseNumber: "A12345",
  });
} catch (err) {
  if (err instanceof ValydVerifyError) {
    console.error(err.status, err.code, err.message);
  } else {
    throw err;
  }
}
```

## Frequent failures and fixes

1. **HTTP 401 — invalid or missing API key.**
   - Cause: The `X-API-Key` header is absent or holds a wrong/revoked key.
   - Fix: Set `X-API-Key: <your API key>` on the request (or `apiKey` in the SDK client). Obtain a valid key from the Developer Portal — your verification-only project, or an app's Verification tab: https://dev.valyd.work

2. **Client timeout on credential / kyc-credential calls.**
   - Cause: Registry lookups can take 10–60 seconds; the default client timeout aborts first.
   - Fix: Configure a generous timeout (e.g. `timeoutMs: 90_000` in the SDK client, or `--max-time 90` for cURL).

3. **HTTP 400 / 404 — validation error or unknown state/provider.**
   - Cause: A required field is missing, an image is unreadable, or the supplied `license_state` / `license_type` (`provider_code`) is not in the registry.
   - Fix: Call `GET /api/v2/credential/states` and `GET /api/v2/credential/states/{state}/providers` first to get valid codes and each provider's `required_fields` — see [Credential discovery](/verifications/standalone/credential-verification#credential-discovery); always include first/last name even if `required_fields` omits it.

---

**Don't want to run these calls yourself?** Bundle the same checks into a workflow and let the
person complete them on our hosted page — no token means the full results still come home to
you: [Hosted delivery](/verifications/hosted) · [Data sharing](/verifications/data-sharing)
