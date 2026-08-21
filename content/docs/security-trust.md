# Trust Center

How Valyd protects the data an integration touches, and where to find the formal
assurances your security review will ask for. The controls below are drawn from Valyd's
documented [Data & trust](/docs/data-and-trust) policies. Formal compliance evidence
(reports, attestations, and a DPA) is shared with enterprise customers on request under
NDA — contact your Valyd account team or **security@valyd.id**.

## Encryption

- **In transit** — every documented endpoint is HTTPS/TLS. Production apps must register
  HTTPS redirect URIs. See [Data & trust](/docs/data-and-trust#security-properties).
- **At rest** — the personal data a Valyd account holds (legal name, KYC fields) is stored
  encrypted at rest on Valyd's systems.
- **Raw KYC data** — document fields extracted during a hosted KYC stay encrypted and are
  released to your integration only after the required ID, liveness, and face-match checks
  pass.
- **Consent-released attributes** — vault-only attributes (DOB, document number, gender,
  nationality) are sealed on the user's device to a key only you hold (libsodium sealed
  box, X25519); Valyd cannot read the released values in transit.
- **Secrets** — API keys and webhook signing secrets are stored encrypted.

## Biometrics are irreversible vectors, never images

Valyd does not store or return face images. Enrollment converts a selfie into a one-way
biometric vector (template); every later face match compares vectors. The template is never
exposed through any API — not to the user, not to integrators. Full detail:
[Biometrics: vectors, never images](/docs/data-and-trust#biometrics-vectors-never-images).

## Transient handling of submitted images

The photos you submit to a check (ID images and selfies) are processed transiently for that
check and are **not retrievable from a Valyd account** afterward. The KYC `portrait` field
is extracted from the ID document you submitted in that request and returned in that
response only — it is not a stored account photo. See
[What data goes where](/docs/data-and-trust#what-data-goes-where).

## Data minimization by design

Account-connected verification returns **proofs only** (verified status, license badges, age
bands), never raw account KYC. The Account API reads what previous checks already proved and
never runs a check itself. This is the recommended integration mode precisely because the
sensitive data stays inside Valyd's controls.

## Compliance & assurance

The following are standard requests in an enterprise security review. Valyd shares its
current status and the underlying evidence with enterprise customers under NDA — contact
your Valyd account team or **security@valyd.id** to request them.

| Item | Status |
| --- | --- |
| SOC 2 (Type I / Type II) | Report and current status available under NDA — contact **security@valyd.id** |
| ISO / IEC 27001 | Current certification status available under NDA — contact **security@valyd.id** |
| GDPR alignment | Posture and controller/processor terms available under NDA — contact **security@valyd.id** |
| Data Processing Agreement (DPA) | Available on request — contact your Valyd account team or **security@valyd.id** to execute a DPA |
| Penetration testing | Summary results available under NDA — contact **security@valyd.id** |
| Vulnerability / breach response | Handled through [Security disclosure](/docs/security-disclosure); incident-response details available under NDA — contact **security@valyd.id** |
| Subprocessors & data residency | Available on request — see [Data residency](/docs/data-residency) |
| Data retention | See [Data retention](/docs/data-retention) |
| Responsible disclosure | See [Security disclosure](/docs/security-disclosure) |

## See also

- [Data retention](/docs/data-retention) — what is kept and for how long
- [Data residency](/docs/data-residency) — where data is processed
- [Operations & SLA](/docs/operations-sla) — uptime, status, incident comms
- [API key lifecycle](/docs/api-key-lifecycle) — key rotation and access model
- [Security disclosure](/docs/security-disclosure) — how to report a vulnerability
