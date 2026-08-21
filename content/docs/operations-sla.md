# Operations & SLA

How Valyd runs the service in production: availability, status, incident communication,
maintenance, and support. The one thing this page states with certainty is the support
diagnostic contract — the `X-Request-Id` header documented in
[Errors & troubleshooting](/docs/errors). A contractual SLA with committed availability
figures is available for enterprise plans — contact your Valyd account team. Nothing on this
page is itself a contractual commitment.

## Availability

| Item | Value |
| --- | --- |
| Uptime / availability target | Committed availability targets are part of the enterprise SLA — contact your Valyd account team |
| Formal SLA & remedies | A contractual SLA with service credits is available on enterprise plans — contact your Valyd account team |
| Status page URL | Available on request — contact **support@valyd.id** |

## Incident communication

| Item | Value |
| --- | --- |
| How incidents are communicated | Available on request — contact **support@valyd.id** |
| Post-incident reviews | Post-incident reviews are available to enterprise customers on request — contact your Valyd account team |

## Maintenance

| Item | Value |
| --- | --- |
| Scheduled-maintenance policy | Available on request — contact **support@valyd.id** |

## Degraded-dependency behavior

When an upstream dependency (the verification engine, a face-match service, or a registry)
is unreachable, Valyd surfaces it as a machine-readable error rather than a silent failure —
retry with backoff. These are the documented signals from the
[error catalog](/docs/errors#3-complete-code-catalog):

- `engine_unreachable` (503) — the verification engine did not respond; retry.
- `face_match_unavailable` (502) / `liveness_unavailable` (502) — the selfie could not be
  checked right now; retry.
- `5xx` in general — Valyd-side; retry with backoff, and if it persists, contact support.

Formal degraded-mode behavior and failover targets (RTO / RPO) are covered on
[Disaster recovery](/docs/disaster-recovery) and, for enterprise plans, in the contractual
SLA — contact your Valyd account team.

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
| Support channel / address | **support@valyd.id** |
| Support hours & response targets | Available on request — contact **support@valyd.id** |
| Escalation path | See [Support & escalation](/docs/support-escalation); for production-impacting incidents contact your Valyd account team |

## See also

- [Trust Center](/docs/security-trust)
- [Rate limits](/docs/rate-limits)
- [Errors & troubleshooting](/docs/errors)
