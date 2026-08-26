---
product: valyd-verify
sdk_min_version: 1.10.3
billable: true
pii_mode: proofs
human_setup_required: true
source_of_truth: sdk
---

# Reusable Verification

> 🔑 **Auth:** SDK client (App API key) + the connected user's `valyd_access_token` · 💾 **Result:** proofs save to the user's Valyd ID — reusable next time

**Reusable Verification** lets a user connect their Valyd identity to your app, share the verified
information they already hold, and complete any additional checks your application requires. The
developer story is one journey:

1. **[Connect the user with Valyd](/docs/authentication)** — standard OpenID Connect; your backend
   receives their `valyd_access_token`. (Connect with Valyd can also serve as your app's sign-in.)
2. **[Read what they already have](/docs/user-token/account)** — profile, `id_verified`, verified
   licenses, badges, and age bands. If the proof you need is there and fresh, you're done — no
   check, no cost.
3. **Something missing? Run your [workflow](/verifications/workflows)** — the saved bundle of
   checks you configured for your app (ID/KYC, professional license, face match, liveness,
   location, …). [Create a session](/verifications/quickstart) with the user's token; Valyd guides
   the user through the capture. A returning user re-verifies with a **selfie only** (matched
   against their stored face vector); already-verified KYC and licenses are skipped.
4. **[Read the result](/verifications/statuses)** — the decision arrives on a signed
   [webhook](/verifications/webhooks) or via `verify.sessions.decision()`. The passed proof lands
   on the user's Valyd ID — next time, step 2 answers instead of step 3.

> **Biometrics are irreversible vectors, never images.** Valyd does not store or return face
> images. Enrollment converts a selfie into a one-way biometric vector (template); every later
> face match compares vectors. The photos submitted to a check are processed transiently for
> that check and are not retrievable from a Valyd account. The template is never exposed through
> any API. [Full scoping →](/docs/data-and-trust)

## The mental model

- **[Workflow](/verifications/workflows)** — a reusable configuration describing which checks your
  app requires (configured in the Developer Portal).
- **[Session](/verifications/quickstart)** — one user's run through a workflow on Valyd's
  verification page.
- **[Checks](/verifications/types)** — the individual verifications: ID/KYC, liveness, face match,
  license, age, location, …
- **[Decision](/verifications/statuses)** — the authoritative combined outcome: `APPROVED` /
  `DECLINED` / `IN_REVIEW`.
- **Proof** — the durable outcome saved to the user's Valyd ID when a check ran with their token;
  read it back via the [Account API](/docs/endpoints#resource-api--user-data). The account's
  `identity` object carries a `verified_at` timestamp so you can judge freshness; a license badge
  carries the registry's own `status` and `expires_at`. Re-run a check when your policy needs a
  fresher answer.

## Data-sharing rule (critical)

- **Account APIs return proofs only** — a pseudonym, `id_verified`, verified license badges, and age
  bands. They **never** return raw KYC (legal name, date of birth, document images). In a decision,
  the `id_verification` check reduces to `{ status, id_verified }`; `identity` is
  `{ valyd_id, pseudonym, id_verified, age_bands, licenses, verified_at }`.
- **Raw account KYC is released only through the consent flow** — you request specific attributes,
  the user approves in their Valyd app, and the values are returned end-to-end encrypted (X25519
  sealed box). See [Consent & data access](/verifications/data-sharing) and
  [Request data](/docs/request-data).
- Documents, selfies, and personal fields stay
  [encrypted with Valyd](/docs/data-and-trust#security-properties), not in your database — you
  **read verified status instead of handling identity data**.
- Webhooks are sent only to an active URL configured for your app and are signed.

## The session in code

Verification runs through the [`@valyd/sdk`](/verifications/sdk) client — you never manage raw
endpoints or capture UI. One call ties the run to the connected user:

```typescript
const session = await verify.sessions.create({
  workflowId,                      // the checks you picked in the portal
  valydAccessToken: accessToken,   // ← ties the run to the connected user
  redirectUrl: "https://yourapp.com/verified",
});
// → send them to session.url — proofs come back, PII doesn't
```

## Start here

- [Connect with Valyd](/docs/authentication) — the OIDC button and callback.
- [Create a workflow](/verifications/setup) — portal setup: app, API key, workflow, webhooks.
- [Run a verification](/verifications/quickstart) — first session end to end.
- [Checks reference](/verifications/types) — everything a workflow can verify.

---

Just need to know whether someone is a live, unique human — no user account involved? That's the
**[Unique Human API](/verifications/standalone)**.
