# API key lifecycle

How Valyd App API keys are issued, rotated, and revoked — and the access model they imply.
The facts below are confirmed from the [Developer Portal](/verifications/console) docs, the
published OpenAPI spec, and the [Verify API reference](/verifications/api-reference). Anything
Valyd's docs do not state is marked for the owner to supply.

## Issuance

- One app in the Developer Portal carries both identities: an OAuth `client_id` /
  `client_secret` for **Login with Valyd**, and a Verify **App API key** (prefix `vrf_…`)
  for the verification APIs.
- **API keys are created by a human in the Developer Portal — never via API.**
- The key is **shown once at creation**. Copy it immediately and store it server-side.
- You can create **multiple apps** (for example Test and Production), each with its own key.

## Authentication

- Verify requests authenticate with `X-API-Key: <App API key>`. A `Bearer` token carrying the
  same key is also accepted.
- A missing or wrong key returns `401 invalid_api_key`; an inactive or misconfigured app
  returns `401 invalid_client` / `403 unauthorized_client` (see the
  [error catalog](/docs/errors#3-complete-code-catalog)).

## Rotation

- **If a key is lost or compromised, rotate it in the Console** to generate a new one.
- **Webhook signing secrets are separately rotatable** per app — see
  [Webhooks](/verifications/webhooks).
- **Zero-downtime overlap** — whether a rotated key leaves the previous key valid for a grace
  period (dual-key overlap) is not documented:
  [owner: confirm — whether rotation supports an overlap window where the old and new key are both valid, and its length].

## Revocation & visibility

| Item | Status |
| --- | --- |
| Explicit revoke (independent of rotation) | [owner: confirm — whether a key can be revoked without minting a replacement] |
| Last-used timestamp / usage visibility | [owner: confirm — whether the Console shows a per-key last-used time or usage] |
| Per-key scopes / least-privilege | [owner: confirm — whether an App API key can be scoped to a subset of Verify capabilities, or is all-or-nothing] |
| Number of active keys per app | [owner: confirm — max simultaneously active API keys per app] |

## Access model: the key IS the authority

An App API key is a **full-authority credential for that app** — there is no separate
reviewer or admin role layered on top of it. The clearest consequence is manual decision
override:

> The manual-decision endpoint (`PATCH /api/v2/session/{id}/status`) is authenticated by your
> app's API key, so **any holder of that key can force a session's terminal decision**
> (`APPROVED` or `DECLINED`). There is no separate reviewer role.

This is documented in the
[Verify API reference — manual override](/verifications/api-reference#patch-apiv2sessionidstatus--manual-override).
Two guardrails still apply on the backend:

- Only an `IN_REVIEW` session can be manually decided — any other state returns
  `409 review_not_pending`.
- A manual `APPROVED` still requires the session's ID, liveness, and face-match checks to
  have passed, or it returns `409 required_face_checks_incomplete`. A manual `DECLINED` has
  no such gate.

Because the key is this powerful, treat it as a high-value secret: store it server-side only,
never ship it to a browser or mobile client, and rotate on any suspected exposure.

## See also

- [The Developer Portal](/verifications/console)
- [Verify API reference](/verifications/api-reference)
- [Trust Center](/docs/security-trust)
