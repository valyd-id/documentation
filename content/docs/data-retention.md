# Data retention

What each class of data a Valyd integration touches is retained for. Two rows are fixed by
Valyd's documented [Data & trust](/docs/data-and-trust) policy — submitted images are
processing-only, and the face biometric exists only as an irreversible vector held until the
account is unlinked or deleted. Retention windows for the remaining data classes are not
published here — contact **support@valyd.id** for the current retention schedule.

## Retention matrix

| Data class | What it is | Retained |
| --- | --- | --- |
| ID document image | Front/back photo submitted to an ID or KYC check | **Transient / processing-only** — processed for the check that received it and not retrievable from a Valyd account afterward ([Data & trust](/docs/data-and-trust#what-data-goes-where)) |
| Selfie image | Liveness / face-match capture | **Transient / processing-only** — same handling as ID images ([Data & trust](/docs/data-and-trust#what-data-goes-where)) |
| Biometric vector (face template) | Irreversible one-way vector derived from an enrolled selfie | **Until the account is unlinked or deleted** — stored only as a vector, never an image, and never exposed through any API ([Data & trust](/docs/data-and-trust#biometrics-vectors-never-images)) |
| Verification decision & proofs | Session decision (`APPROVED` / `DECLINED` / `IN_REVIEW`) and durable proofs (`id_verified`, license badges, age bands) | Available on request — contact **support@valyd.id** for the current retention schedule |
| Webhook delivery log | Record of signed events POSTed to your endpoint | Available on request — contact **support@valyd.id** for the current retention schedule |
| Application / request logs | Operational logs keyed by `X-Request-Id` | Available on request — contact **support@valyd.id** for the current retention schedule |
| Audit & billing records | Account, usage, and billing history | Retained per applicable legal, tax, and accounting requirements — contact **support@valyd.id** for the current schedule |

## Deletion

- **Biometric vectors** are held until the account is unlinked from your app or the account
  is deleted. Account deletion behavior surfaces in the error catalog via `user_deleted`
  (410) — a device linked to a deleted account must clear local data and re-register.
- **Submitted images** are never persisted to an account, so there is nothing to delete
  after a check completes — they exist only for the duration of processing.
- **End-user erasure requests / right-to-be-forgotten** — deleting or unlinking a Valyd
  account clears the stored biometric vector (a device linked to a deleted account
  re-registers, surfaced as `user_deleted` (410)). For a formal erasure request or the
  completion timeline, contact **support@valyd.id**.

## See also

- [Trust Center](/docs/security-trust)
- [Data residency](/docs/data-residency)
- [Data & trust](/docs/data-and-trust)
