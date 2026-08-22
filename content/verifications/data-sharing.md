# Data sharing across the two lanes

> 🔑 **Auth:** App API key (`X-API-Key`), plus the user's `valyd_access_token` for Managed by Valyd

Where identity data ends up depends on the lane:

- **[Managed by Valyd](/verifications/managed)** — the user signs in and you run a hosted session
  with their `valyd_access_token`. You receive the **decision plus reusable proofs** (a pseudonym,
  `id_verified`, verified license badges, age bands) — **never raw PII**. The raw identity data
  (documents, DOB, face images) stays **encrypted with Valyd** under the user's per-user key.
- **[Verify Fresh](/verifications/standalone)** — no login, no Valyd account. This is the one place
  where check data flows **to you**: you supply the inputs (the images for a liveness / uniqueness /
  anti-spoof check), Valyd processes them, and the result is returned to your system. Nothing is
  written to a Valyd account, and there is no proof to reuse later; the data, and the duty of care
  that comes with it, are yours.

The rest of this page covers the **Verify Fresh** lane — the one where you hold the result. (In
Managed by Valyd, Valyd holds the raw data and you only ever receive proofs.)

## Who holds what (Verify Fresh)

| | You (the integrator) | Valyd |
| --- | --- | --- |
| **Inputs** (the selfie / face images for a liveness, uniqueness, or anti-spoof check) | You capture and submit them | Processed **transiently** for that check, then discarded — not retrievable afterwards |
| **Results** (check status, scores, the per-check `data`) | Returned in the HTTP response — yours to store | A session record of the check outcome (status, scores, billing/audit metadata), not the raw images |
| **Biometrics** | Never receive a face template | Face vectors only where a gallery feature is used (face-uniqueness / antispoof-identity) — irreversible vectors, **never images** |
| **Storage, protection, deletion** | **Your responsibility** — encrypt at rest, restrict access, delete per your retention policy and local law | Retention limited to the transient processing and session record above |

> **Biometrics are irreversible vectors, never images.** Valyd does not store or return face
> images. The photos you submit to a check are processed transiently for that check and are not
> retrievable afterwards. Where a gallery feature (face uniqueness, anti-spoof + identity)
> enrolls a face, it stores a one-way biometric vector (template) — never the photo — and the
> template is never exposed through any API. `DELETE /api/v2/face-uniqueness/{valyd_uuid}`
> removes a face from the gallery. [Full scoping →](/docs/data-and-trust)

## Your responsibilities

- **Store securely** — the images you submit and the check `data` you get back can be sensitive;
  encrypt them at rest and keep them out of logs.
- **Limit access** — treat check results with the same access controls as any biometric record.
- **Delete on schedule** — you own the retention clock; delete when your policy or the user's
  request requires it.
- **Keep the key server-side** — `X-API-Key` never belongs in a browser.

## Need ID/KYC, face match, age, license, or location?

Those checks are not part of Verify Fresh — they run only through
**[Managed by Valyd](/verifications/managed)**: sign the user in and run a hosted session with their
`valyd_access_token`. The passed proof saves to *their* Valyd ID, the raw identity data stays
encrypted with Valyd, and your app reads verified status instead of storing documents.
