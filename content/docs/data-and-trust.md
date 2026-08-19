# Data & trust

What a Valyd verification actually asserts, what happens to the data a check touches, and what
your app can (and cannot) receive.

## What "verified" means

A verification is a **point-in-time assertion**: at the moment the check ran, the document was
authentic, the selfie was live, the face matched, the license was active in its registry. Proofs
saved to an account are durable outcomes of those checks — the account's `identity` object carries
a `verified_at` timestamp so you can judge freshness, and a license's registry record carries its
own `status` and `expires_at`. Re-run a check when your policy needs a fresher answer.

## Biometrics: vectors, never images

> **Biometrics are irreversible vectors, never images.** Valyd does not store or return face
> images. Enrollment converts a selfie into a one-way biometric vector (template); every later
> face match compares vectors. The photos you submit to a check are processed transiently for
> that check and are not retrievable from a Valyd account.

Two clarifications that scope this claim precisely:

- **The template itself is never exposed through any API** — not to the user, not to integrators.
  It exists only to be compared against inside Valyd.
- **The KYC `portrait` field is not a stored account photo.** The `portrait` returned by
  ID/KYC checks (e.g. `kyc-credential`, `id-verification`) is extracted from the ID document
  **you** submitted in that request and is returned in that response only.

## What data goes where

| Data | What happens |
| --- | --- |
| ID images & selfies | Processed transiently for the check that received them; not retrievable from a Valyd account. |
| Face biometrics | Stored only as an irreversible one-way vector; matching compares vectors (see above). |
| Legal name | Returned to your app at login via [`userinfo`](/docs/endpoints) under the `profile` scope the user approved. |
| DOB, document number, gender, nationality | **Vault-only.** Released solely through the explicit [consent flow](/docs/request-data), sealed on the user's device to your X25519 key — end-to-end encrypted; the server is blind to them. |
| Age | Shared as derived **age bands** (`is_18_plus`, …) without exposing the raw DOB; the raw `dob` needs the consent flow. |
| Verification status & proofs (`id_verified`, license badges, age bands) | Read via the [Account API](/docs/endpoints#resource-api--user-data), gated by the [scopes](/docs/scopes) the user approved at login. |
| [Standalone](/verifications/standalone) check results | Returned to your system only; nothing is added to a Valyd account. Raw KYC fields in a hosted decision are released only after the required ID, liveness, and face-match gates pass — until then they remain encrypted. |
| Account-connected results | The account APIs return **proofs only**, never raw account KYC ([details](/verifications/managed)). |

Two rules cover everything:

- **The Account API never runs a check** — it reads what previous checks already proved.
- **A check never touches an account** — unless you attach the user's token.

## Security properties

**Encryption, per Valyd's data policies:**

- **Identity fields at rest** — the personal data a Valyd account holds (legal name, KYC fields)
  is stored encrypted at rest on Valyd's systems.
- **Raw KYC data** — document fields extracted during a hosted KYC stay encrypted and are
  released to your integration only after the required ID, liveness, and face-match checks pass.
- **Consent-released attributes** — data released through the consent flow is sealed end-to-end
  to a key only you hold; Valyd cannot read it in transit.
- **Biometrics** — accounts hold irreversible face vectors, never images; templates are never
  exposed through any API.
- **Secrets** — API keys and webhook signing secrets are stored encrypted; transport is TLS
  everywhere.

This is why account-connected verification is the recommended mode: the sensitive data stays
inside these controls, and your application reads verified status.

- **TLS everywhere** — every documented endpoint is HTTPS; register HTTPS redirect URIs in
  production.
- **Sensitive KYC fields stay encrypted** until a one-off decision's required ID, liveness, and
  face-match gates pass.
- **Consent data is end-to-end encrypted** — vault-only attributes are sealed on the user's
  device to your public key (libsodium sealed box); with self-custody, Valyd cannot read the
  released values.
- **Webhooks are signed** (HMAC-SHA256 over the raw body with a per-app secret) and sent only to
  the active URL configured for your app — [verify them](/verifications/webhooks).
- **The user stays in control**: consent is per-field and per-app, remembered but revocable from
  *Connected sites* in their Valyd account.

For what each check asserts individually, see [Verification types](/verifications/types); for
what your app should do with results, see [Decisions & statuses](/verifications/statuses).
