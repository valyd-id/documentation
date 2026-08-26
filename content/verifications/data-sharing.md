# Consent & data access

> 🔑 **Auth:** SDK client (App API key), plus the user's `valyd_access_token` for Reusable Verification

The two products share very different data with your application:

- **[Reusable Verification](/verifications)** — the user connects with Valyd and you run a
  verification session with their `valyd_access_token`. You receive the **decision plus reusable
  proofs** (a pseudonym, `id_verified`, verified license badges, age bands) — raw identity data is
  shared only with the user's explicit consent. The raw identity data (documents, DOB, face images)
  stays **encrypted with Valyd** under the user's per-user key.
- **[Unique Human API](/verifications/standalone)** — no login, no Valyd account. This is the one
  place where check data flows **to you**: you supply the input (the images for an anti-spoof
  check), Valyd processes them, and the result is returned to your system. Nothing is written to a
  Valyd account, and there is no proof to reuse later; the data, and the duty of care that comes
  with it, are yours.

The rest of this page covers the **Unique Human API** — the product where you hold the result. (In
Reusable Verification, Valyd holds the raw data and you only ever receive proofs.)

## Who holds what (Unique Human API)

| | You (the integrator) | Valyd |
| --- | --- | --- |
| **Inputs** (the selfie / face images for an anti-spoof check) | You capture and submit them | Processed **transiently** for that check, then discarded — not retrievable afterwards |
| **Results** (check status, scores, the per-check `data`) | Returned in the HTTP response — yours to store | A session record of the check outcome (status, scores, billing/audit metadata), not the raw images |
| **Biometrics** | Never receive a face template | Face vectors are irreversible templates, **never images** — and are not returned to you |
| **Storage, protection, deletion** | **Your responsibility** — encrypt at rest, restrict access, delete per your retention policy and local law | Retention limited to the transient processing and session record above |

> **Biometrics are irreversible vectors, never images.** Valyd does not store or return face
> images. The photos you submit to a check are processed transiently for that check and are not
> retrievable afterwards. Where a gallery feature (face uniqueness, anti-spoof + identity)
> enrolls a face, it stores a one-way biometric vector (template) — never the photo — and the
> template is never exposed through any API. [Full scoping →](/docs/data-and-trust)

## Your responsibilities

- **Store securely** — the images you submit and the check `data` you get back can be sensitive;
  encrypt them at rest and keep them out of logs.
- **Limit access** — treat check results with the same access controls as any biometric record.
- **Delete on schedule** — you own the retention clock; delete when your policy or the user's
  request requires it.
- **Keep the key server-side** — the App API key never belongs in a browser.

## Need ID/KYC, face match, age, license, or location?

Those checks are not part of the Unique Human API — they run only as workflow checks in
**[Reusable Verification](/verifications)**: the user connects with Valyd and you run a
verification session with their `valyd_access_token`. The passed proof saves to *their* Valyd ID,
the raw identity data stays encrypted with Valyd, and your app reads verified status instead of
storing documents.
