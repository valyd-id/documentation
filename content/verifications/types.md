# Checks reference

> 🔑 **Auth:** SDK client (App API key) · 💾 Run in a workflow with the user's `valyd_access_token` and the passed proof saves to their Valyd ID

Every check Valyd can run, in one place: what it verifies, what the user provides, what comes
back, and where it's available — inside a **[Reusable Verification](/verifications)**
[workflow](/verifications/workflows) (a connected user's session, where every check runs) and/or
as a direct **[Unique Human API](/verifications/unique-human)** call (API key only, no user login).

## ID verification — `id_verification`

Verifies a government ID: OCR of the document fields plus an authenticity score.
The user provides the front (and optionally back) image of the ID. You get back a proof that the
document was verified; the raw extracted fields stay encrypted on the account.
Use it whenever you need to know who a document says someone is.
**Available:** [Reusable Verification](/verifications) workflow

## Liveness — `liveness`

Passive liveness on a single selfie: is this a real, live capture?
Use it as the cheap first gate before a face match.
**Available:** [Reusable Verification](/verifications) workflow

## Anti-spoof — `antispoof`

Stronger "is this a live human capture?" answer with a vendor-neutral `human_score` (0–100). The
user provides a single image (score capped at 85) or a 3–8 frame burst captured over ~2s, which
adds motion and same-person consistency analysis. A workflow session captures a live camera burst
with a random on-screen action for the strongest assurance (`assurance: "captured"`).
Use it when presentation attacks (photos of photos, replays) are a real threat.
**Available:** [Unique Human API — Liveness](/verifications/unique-human/antispoof) (no-account workflow session) · [Reusable Verification](/verifications) workflow

## Anti-spoof + identity — `antispoof/identity`

Runs the identical anti-spoof pipeline and, only if it passes, resolves the proven-live face to a
stable `valyd_` uuid from the global face gallery. You get the `human_score` plus
`identity: { valyd_uuid, registered }` — the same face resolves to the same uuid whenever the
gallery match clears its similarity threshold. Use it for duplicate-account / sybil detection with
liveness assurance built in.
**Available:** [Unique Human API](/verifications/unique-human/face-uniqueness) (no-account workflow session) · [Reusable Verification](/verifications) workflow

## Face uniqueness — `face-uniqueness`

One face = one Valyd uuid. Enrolls or matches a selfie against the global gallery and returns the
stable `valyd_uuid` plus whether it was newly registered. Use it to stop one person opening many
accounts.
**Available:** [Unique Human API — Uniqueness](/verifications/unique-human/face-uniqueness) (no-account workflow session) · [Reusable Verification](/verifications) workflow

## Face match — `face_match`

1:1 comparison of two face images — typically the ID portrait against a fresh selfie. You get
`similarity` and the pass `threshold` (default ~0.95). Use it to bind a live person to a verified
document.
**Available:** [Reusable Verification](/verifications) workflow

## Age verification — `age`

Computes age bands from a verified date of birth. With a `valyd_access_token` the bands are
computed from the account's KYC-verified DOB and returned as a proof. Use it for age-gated products.
**Available:** [Reusable Verification](/verifications) workflow

## License / credential verification — `credential`

Looks up a professional license in the provider registry and matches it to a name. In a workflow
session the name comes from the verified ID (never client-supplied); you get `match` and the
registry's `license` record (status, expiry, specialty). Registry lookups can take 10–60 s. Use it
to verify doctors, nurses, and other licensed professionals.
**Available:** [Reusable Verification](/verifications) workflow

## KYC + credential — combined

ID verification + liveness + face match + license lookup in one workflow session. The license is
matched against the name OCR'd from the ID — never a client-supplied name — so a caller cannot
substitute an arbitrary name to claim someone else's license. You get a per-check breakdown plus
the verified `identity` proof. `status` is `"passed"` only when every check passes.
**Available:** [Reusable Verification](/verifications) workflow

## Location — `location`

Records and validates a geolocation fix for a session. Used by workflows like EVV (electronic
visit verification) to prove where a check happened.
**Available:** [Reusable Verification](/verifications) workflow

---

> **Biometrics are irreversible vectors, never images.** Valyd does not store or return face
> images. Enrollment converts a selfie into a one-way biometric vector (template); every later
> face match compares vectors. The photos you submit to a check are processed transiently for
> that check and are not retrievable from a Valyd account. The template is never exposed through
> any API, and the ID `portrait` in a KYC result is extracted from the document you submitted in
> that request — not a stored account photo. [Full scoping →](/docs/data-and-trust)

Next: bundle checks into a [workflow](/verifications/workflows), or — for the direct liveness and
uniqueness calls — see the [Unique Human API](/verifications/unique-human).
