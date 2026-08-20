# Verification types

> 🔑 **Auth:** App API key (`X-API-Key`) · 💾 Run with the user's `valyd_access_token` and the passed proof saves to their Valyd ID

Every check Valyd can run, in one place: what it verifies, what the user provides, what comes
back, and whether it's available on the [hosted flow](/verifications/hosted), as a direct API
call, or both. Request/response bodies live in the
[standalone reference](/verifications/standalone) — each section links to its endpoint.

## ID verification — `id_verification`

Verifies a government ID: OCR of the document fields plus an authenticity score.
The user provides the front (and optionally back) image of the ID. You get back the extracted
`fields` (name, document number, DOB, expiry, …), the ID `portrait`, and an `authenticity` score.
Use it whenever you need to know who a document says someone is.
**Available:** Hosted (workflow feature) · [Direct API →](/verifications/standalone/id-verification)

## Liveness — `liveness`

Passive liveness on a single selfie: is this a real, live capture? The user provides one selfie
image. You get `live_score` (`1` = live, `0` = spoof, `< 0` = no face) and a `result`.
Use it as the cheap first gate before a face match.
**Available:** Hosted (workflow feature) · [Direct API →](/verifications/standalone/liveness)

## Anti-spoof — `antispoof`

Stronger "is this a live human capture?" answer with a vendor-neutral `human_score` (0–100). The
user provides a single image (score capped at 85) or a 3–8 frame burst captured over ~2s, which
adds motion and same-person consistency analysis. The hosted flow captures a live camera burst
with a random on-screen action for the strongest assurance (`assurance: "captured"`).
Use it when presentation attacks (photos of photos, replays) are a real threat.
**Available:** Hosted (strongest) · [Direct API →](/verifications/standalone/antispoof)

## Anti-spoof + identity — `antispoof/identity`

Runs the identical anti-spoof pipeline and, only if it passes, resolves the proven-live face to a
stable `valyd_` uuid from the global face gallery. Same input as anti-spoof. You get the
`human_score` plus `identity: { valyd_uuid, registered }` — the same face resolves to the same
uuid whenever the gallery match clears its similarity threshold. Use it for duplicate-account /
sybil detection with liveness assurance built in.
**Available:** [Direct API →](/verifications/standalone/antispoof#post-apiv2antispoofidentity--anti-spoof--identity)

## Face uniqueness — `face-uniqueness`

One face = one Valyd uuid. Enrolls or matches a selfie against the global gallery and returns the
stable `valyd_uuid` plus whether it was newly registered (`"new"` / `"existing"`). The user
provides a selfie or a frame burst. Use it to stop one person opening many accounts;
`DELETE /api/v2/face-uniqueness/{valyd_uuid}` unlinks a face (e.g. test data).
**Available:** [Standalone only →](/verifications/standalone/face-uniqueness) — it never runs
with a user's token: a Valyd account already guarantees one face = one person.

## Face match — `face_match`

1:1 comparison of two face images — typically the ID portrait against a fresh selfie. You provide
both images; you get `similarity` and the pass `threshold` (default ~0.95). Use it to bind a live
person to a verified document.
**Available:** Hosted (workflow feature) · [Direct API →](/verifications/standalone/face-match)

## Age verification — `age`

Computes age bands from a date of birth **you supply — the DOB itself is not independently
verified** by this check. You provide `dob` and the `bands` (e.g. `["is_18_plus","is_21_plus"]`);
you get the age and, per band, a flag telling you whether that DOB satisfies the band. Use it for
age-gated products where you already hold a verified DOB (e.g. from `id_verification`), or attach
a `valyd_access_token` to compute bands from the account's KYC-verified DOB instead.
**Available:** [Direct API →](/verifications/standalone/age-verification)

## License / credential verification — `credential`

Looks up a professional license in the provider registry and matches it to a name. You provide
name + license type, state, and number (use the [state → license type → verify flow](/verifications/standalone/credential-verification#the-full-flow-state--license-type--verify)
to build pickers); you get `match` and the registry's `license` record (status, expiry, specialty).
Registry lookups can take 10–60 s. Use it to verify doctors, nurses, and other licensed
professionals.
**Available:** Hosted ("License Verification" workflow) · [Direct API →](/verifications/standalone/credential-verification)

## KYC + credential — combined

ID verification + liveness + face match + license lookup in one call. The license is matched
against the name OCR'd from the ID — never a client-supplied name — so a caller cannot substitute
an arbitrary name to claim someone else's license. You provide the ID front, a selfie, and the license details; you get a per-check
breakdown plus the verified `identity` (name, DOB). `status` is `"passed"` only when every check
passes.
**Available:** Hosted ("KYC + License" workflow) · [Direct API →](/verifications/standalone/kyc-credential)

## Location — `location`

Records and validates a geolocation fix for a session. You provide `latitude`, `longitude`, and
optionally `accuracy` in metres. Used by workflows like EVV (electronic visit verification) to
prove where a check happened.
**Available:** Workflows / [Direct API →](/verifications/standalone/location)

---

> **Biometrics are irreversible vectors, never images.** Valyd does not store or return face
> images. Enrollment converts a selfie into a one-way biometric vector (template); every later
> face match compares vectors. The photos you submit to a check are processed transiently for
> that check and are not retrievable from a Valyd account. The template is never exposed through
> any API, and the ID `portrait` in a KYC result is extracted from the document you submitted in
> that request — not a stored account photo. [Full scoping →](/docs/data-and-trust)

Next: bundle checks into a [workflow](/verifications/workflows) for the hosted flow, or call the
endpoints directly — the request/response reference lives on
[Standalone checks](/verifications/standalone).
