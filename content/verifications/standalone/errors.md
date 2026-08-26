# Common errors

These are the errors you hit on the **Unique Human API**. The SDK throws a
`ValydVerifyError` carrying `{ code, status, message }`; catch it and read those fields:

```javascript
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

try {
  const session = await verify.sessions.create({
    workflowId:  process.env.VALYD_WORKFLOW_ID,   // liveness and/or uniqueness
    redirectUrl: "https://yourapp.com/checked",
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

1. **Invalid or missing API key.**
   - Cause: the `apiKey` passed to `VerifyClient` is absent, wrong, or revoked.
   - Fix: set `apiKey` on the client from a valid key. Obtain one from the Developer Portal — open a
     project's **Verification** tab, or use your organization's built-in **Verify Fresh** key on the
     dashboard: https://dev.valyd.work

2. **Missing or invalid `workflowId`.**
   - Cause: the session was created without a real workflow id (`VALIDATION_ERROR`).
   - Fix: build a workflow with the liveness / uniqueness checks in the Developer Portal and pass
     its `workflowId`.

3. **Rate limited.**
   - Cause: too many calls in a short window.
   - Fix: back off and retry with jitter.

A spoof verdict is not an error — the session completes and the decision's antispoof check data
carries the failure `signal`. See [Liveness](/verifications/standalone/antispoof) for the signals.

---

**Need ID/KYC, face match, age, professional license, or location?** Those run as workflow checks
in [Reusable Verification](/verifications) on a connected user's verification session, where the
decision returns with a status (`APPROVED` / `DECLINED` / `IN_REVIEW`) rather than throwing. See
also [Run a verification](/verifications/quickstart) · [Consent & data access](/verifications/data-sharing).
