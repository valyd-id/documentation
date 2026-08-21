# Operations & SLA

How Valyd runs the service in production: availability, status, incident communication,
maintenance, and support. The one thing this page states with certainty is the support
diagnostic contract — the `X-Request-Id` header documented in
[Errors & troubleshooting](/docs/errors). Every availability and SLA figure below is a
placeholder until the owner supplies the committed target; nothing here is a contractual
commitment until confirmed.

## Availability

| Item | Value |
| --- | --- |
| Uptime / availability target | [owner: confirm — committed uptime target (e.g. 99.9%) and the SLA tier(s) it applies to] |
| Formal SLA & remedies | [owner: confirm — whether a contractual SLA with service credits exists, and where it is published] |
| Status page URL | [owner: confirm — public status page URL] |

## Incident communication

| Item | Value |
| --- | --- |
| How incidents are communicated | [owner: confirm — channel used for incident updates (status page, email, etc.)] |
| Post-incident reviews | [owner: confirm — whether post-incident / RCA reports are shared and how to request them] |

## Maintenance

| Item | Value |
| --- | --- |
| Scheduled-maintenance policy | [owner: confirm — maintenance window policy and advance-notice period] |

## Degraded-dependency behavior

When an upstream dependency (the verification engine, a face-match service, or a registry)
is unreachable, Valyd surfaces it as a machine-readable error rather than a silent failure —
retry with backoff. These are the documented signals from the
[error catalog](/docs/errors#3-complete-code-catalog):

- `engine_unreachable` (503) — the verification engine did not respond; retry.
- `face_match_unavailable` (502) / `liveness_unavailable` (502) — the selfie could not be
  checked right now; retry.
- `5xx` in general — Valyd-side; retry with backoff, and if it persists, contact support.

Formal degraded-mode behavior and failover targets (RTO / RPO):
[owner: confirm — documented degraded-mode / failover behavior and any RTO/RPO targets].

## Support & escalation

Every Valyd response carries an **`X-Request-Id`** header. When you contact support, include:

- the **`X-Request-Id`** header value,
- the session / event id if relevant,
- a timestamp, and
- the endpoint you called.

**Never send** API keys, tokens, or the person's identity data — support will never ask for
them. This is the exact guidance from [Errors & troubleshooting](/docs/errors#contacting-support).

| Item | Value |
| --- | --- |
| Support channel / address | [owner: confirm — support contact address or portal] |
| Support hours & response targets | [owner: confirm — support hours and first-response targets by severity] |
| Escalation path | [owner: confirm — escalation path for production-impacting incidents] |

## See also

- [Trust Center](/docs/security-trust)
- [Rate limits](/docs/rate-limits)
- [Errors & troubleshooting](/docs/errors)
