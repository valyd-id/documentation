# Choose your integration

Three integrations, one decision tree. Answer two questions and you know exactly which docs to
follow.

```mermaid
flowchart TD
    Q1{"Need to VERIFY someone? (KYC, liveness, face, age, license)"}
    Q1 -->|"No — only authentication"| LOGIN["LOGIN WITH VALYD — standard OIDC sign-in; read the proofs the account already holds (/docs)"]
    Q1 -->|Yes| Q2{"Should Valyd build the capture UI? (camera, retries, ID scan)"}
    Q2 -->|Yes| H["HOSTED VERIFICATION — create a session, redirect to Valyd's page, get one decision back (/verifications/hosted)"]
    Q2 -->|No| C["CORE API — call each check from your backend with X-API-Key; you build the UI (/verifications/standalone)"]
    H --> Q3{"Save the passed result to the person's Valyd account?"}
    C --> Q3
    Q3 -->|"Yes (recommended)"| M["Sign the user in first, then attach their valyd_access_token — the proof saves to their account; you read verified status, Valyd holds the identity data (/verifications/managed)"]
    Q3 -->|No| S["Run it standalone — the result AND the person's identity fields return to your system; managing that data is your responsibility"]
```

## Comparison

| | Hosted verification | Core API | Login with Valyd |
| --- | --- | --- | --- |
| Verifies someone? | Yes — all workflow checks in one session | Yes — one check per call | No — reads proofs already on the account |
| Hosted UI by Valyd | Yes (capture page) | No | Yes (the sign-in screen) |
| You build custom UI | Redirect only | Yes, fully | Just a button |
| User needs a Valyd account | No (only if attaching the result) | No (only if attaching the result) | Yes |
| OIDC | Optional — only for account attach | Optional — only for account attach | Required — it *is* OIDC |
| Credential | `X-API-Key` + `workflow_id` | `X-API-Key` | `client_id` + `client_secret` |
| Result arrives via | Signed webhook + decision endpoint | Synchronous JSON response | Bearer token → Account API |
| Best for | KYC / ID + selfie capture, bundled checks | License lookup, backoffice, batch, custom UI | Sign-in, reading reusable proofs |

## Start here

- **Hosted verification** → [Hosted flow](/verifications/hosted) · [No-login quickstart](/verifications/quickstart)
- **Core API** → [Core APIs](/verifications/standalone)
- **Login with Valyd** → [Add the button](/docs) · [Complete example](/docs/quick-start)
- **Verify and save to the account** → [Reusable identity](/verifications/managed)

> OIDC does not run a verification check — it signs the user in. The Verification API runs the
> check. One optional token ([account attach](/verifications/managed)) connects the two.
