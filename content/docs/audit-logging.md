# Audit logging

What activity a Valyd integration can observe, and where a developer or org admin reads it.
Four things are verifiable today from Valyd's own docs — the `X-Request-Id` on every
response, the verification event records, the webhook delivery log in the Developer Portal,
and org login attribution via the `valyd_org_member_id` claim. Everything beyond those
observable signals (log retention, export/SIEM, tamper-evidence, an account-level admin audit
trail) is a placeholder until the owner supplies it; nothing here asserts an audit capability
Valyd has not documented.

## Request correlation: `X-Request-Id`

Every Valyd response carries an **`X-Request-Id`** header — the correlation id for that single
request. It is the one identifier you quote to support to have a specific call traced, and it
is the value support asks for first. Log it on your side against your own request records so a
later investigation can line up your logs with Valyd's. See
[Errors & troubleshooting](/docs/errors#contacting-support) for the exact support contract, and
never quote API keys or tokens alongside it.

## Verification events

Each verification session produces durable, machine-readable event records you can act on:

- **Terminal outcomes** — `verification.approved` / `verification.declined`.
- **Non-terminal states** — `verification.in_review` (a manual/agent review is pending),
  `verification.abandoned` (the user left the hosted flow), `verification.expired` (the
  session TTL elapsed).

Each event carries a stable **`event_id`** (mirrored in the `X-Valyd-Event-Id` header) and the
`session_id` that produced it. The decision API
(`GET /api/v2/session/{id}/decision`) is the **authoritative** record of a session's result —
poll or fetch it any time, independent of whether a webhook was delivered. Full event shape:
[Webhooks](/verifications/webhooks).

## Webhook delivery log

Every webhook attempt — successful or failed — is recorded in the **Developer Portal**, on your
application's **Verification** page under **Recent webhook deliveries**. For each attempt the log
shows the destination URL, the exact payload and headers Valyd sent, the receiver's HTTP status
and response body, and any transport error. A delivery is retried automatically (up to 10
attempts across roughly 2.5 hours), and the **Resend** button re-queues any delivery on demand —
a resend carries the **same** `X-Valyd-Event-Id`, so an idempotent handler treats it as the same
event. This is the built-in place to confirm what Valyd told your endpoint and when. Details:
[Webhooks — delivery log and manual resend](/verifications/webhooks).

## Who signed in: `valyd_org_member_id`

For an [organization](/docs/organizations), you always know exactly which of your people just
logged in. When an org member signs in with Login with Valyd, the **`valyd_org_member_id`** claim
returns on the OIDC [userinfo response](/docs/endpoints#get-userinfo--get-user-profile) and in the
ID token (scoped to your org's client). Its value is that member's `vmem_…` id — your join key
between your own roster and the login — so you can attribute and track logins against your own
records. See [Organizations & teams](/docs/organizations#how-organizations-work).

## Not yet documented (owner to confirm)

These are standard audit questions an enterprise review asks. Each is a placeholder — Valyd does
not assert any of these until confirmed. Retention windows for the delivery log and request logs
are tracked separately on [Data retention](/docs/data-retention).

| Question | Answer |
| --- | --- |
| History depth in the Portal | [owner: confirm — how far back the Recent webhook deliveries list shows in the Portal, and whether older deliveries are queryable] |
| Export / SIEM | [owner: confirm — whether verification-event and webhook-delivery activity can be exported (CSV/API) or streamed to an external SIEM, and how] |
| Tamper-evidence | [owner: confirm — whether Valyd's activity records are append-only / tamper-evident, and whether that property is attestable] |
| Admin audit trail | [owner: confirm — whether an account-level audit trail records config changes (API-key rotation, member add/remove, app settings, manual decision overrides) and where an org admin reads it] |
| Who can read the logs | [owner: confirm — which roles can view the delivery log and event history, and whether member-role users are excluded] |

## See also

- [Errors & troubleshooting](/docs/errors) — the `X-Request-Id` support contract
- [Webhooks](/verifications/webhooks) — event shape, retries, and the delivery log
- [Data retention](/docs/data-retention) — how long logs and records are kept
- [Support & escalation](/docs/support-escalation) — what to send when you contact support
- [Trust Center](/docs/security-trust)
