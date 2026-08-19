# Data sharing on standalone checks

> 🔑 **Auth:** App API key (`X-API-Key`) · 👤 **User login:** not required — no Valyd account is involved

[Standalone checks](/verifications/standalone) are the one place in Valyd where identity data flows **to you**. You supply the
inputs (images, names, license numbers, a DOB), Valyd processes them, and the result — including
any extracted identity fields — is returned to your system. Nothing is written to a Valyd
account, and there is no proof to reuse later; the data, and the duty of care that comes with it,
are yours.

## Who holds what

| | You (the integrator) | Valyd |
| --- | --- | --- |
| **Inputs** (ID images, selfies, names, license numbers, DOB) | You capture and submit them | Processed **transiently** for that check, then discarded — not retrievable afterwards |
| **Results** (check status, scores, extracted `fields`, ID `portrait`, license registry data) | Returned in the HTTP response — yours to store | A session record of the check outcome (status, scores, billing/audit metadata), not the raw images |
| **Biometrics** | Never receive a face template | Face vectors only where a gallery feature is used (face-uniqueness / antispoof-identity) — irreversible vectors, **never images** |
| **Storage, protection, deletion** | **Your responsibility** — encrypt at rest, restrict access, delete per your retention policy and local law | Retention limited to the transient processing and session record above |

> **Biometrics are irreversible vectors, never images.** Valyd does not store or return face
> images. The photos you submit to a check are processed transiently for that check and are not
> retrievable afterwards. Where a gallery feature (face uniqueness, anti-spoof + identity)
> enrolls a face, it stores a one-way biometric vector (template) — never the photo — and the
> template is never exposed through any API. `DELETE /api/v2/face-uniqueness/{valyd_uuid}`
> removes a face from the gallery. [Full scoping →](/docs/data-and-trust)

## Your responsibilities

- **Store securely** — the extracted `fields` and `portrait` from an ID check are PII; encrypt
  them at rest and keep them out of logs.
- **Limit access** — treat check results with the same access controls as any identity document.
- **Delete on schedule** — you own the retention clock; delete when your policy or the user's
  request requires it.
- **Keep the key server-side** — `X-API-Key` never belongs in a browser.

## Prefer not to hold identity data at all?

That's the main Valyd story: sign the user in and run the same checks with their
`valyd_access_token` — the proof saves to *their* Valyd ID, and your app reads verified status
instead of storing documents. See [Verify the user](/verifications/managed).
