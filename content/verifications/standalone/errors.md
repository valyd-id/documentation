# Common errors

These are the errors you hit on the **Verify Fresh** checks (liveness, anti-spoof, face
uniqueness). Over HTTP, failures return the envelope `{ success: false, error: { code, message } }`
with the matching HTTP status:

- `401` — invalid or missing API key.
- `400` — validation error (missing field, unreadable image, or no face detected).
- `429` — rate limited.
- `5xx` — internal error.

In the SDK, the same failures throw `ValydVerifyError` with `{ code, status, message }`:

```javascript
import { VerifyClient, ValydVerifyError, readImage } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey: process.env.VALYD_API_KEY,
});

try {
  const { check } = await verify.standalone.liveness({
    image: readImage("./selfie.jpg"),
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

2. **HTTP 400 — unreadable image or no face detected.**
   - Cause: The submitted image is corrupt, too small/blurry, or contains no detectable face.
   - Fix: Send a clear, well-lit, front-facing capture; for anti-spoof bursts send 3–8 frames in the `frames[]` field.

3. **HTTP 429 — rate limited.**
   - Cause: Too many requests in a short window.
   - Fix: Back off and retry with jitter; reuse an `Idempotency-Key` so a retry can't double-run a check.

---

**Need ID/KYC, face match, age, professional license, or location?** Those run through
[Managed by Valyd](/verifications/managed) on a signed-in user's hosted session, not as Verify
Fresh direct calls. **Don't want to build the capture UI at all?** Bundle the Verify Fresh checks
into a workflow and let the person complete them on our hosted page — the results still come home
to you: [Hosted delivery](/verifications/hosted) · [Data sharing](/verifications/data-sharing)
