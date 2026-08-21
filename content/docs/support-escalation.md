# Support & escalation

How to get help with Valyd and what to include so it can be triaged fast. Two things are fixed
here: security vulnerabilities route through the [Security disclosure](/docs/security-disclosure)
page, not normal support; and for an API or integration problem the details to send (and the
things to *never* send) are the exact diagnostic contract from
[Errors & troubleshooting](/docs/errors#contacting-support). Every support channel, tier,
response-time target, and status-page URL below is a placeholder until the owner supplies it —
nothing here invents a contact address, hours, or an SLA.

## Security issues go through disclosure

A suspected vulnerability, exposed secret, or any security-sensitive finding does **not** go to
normal support — report it through [Security disclosure](/docs/security-disclosure), which is the
home for the security contact and the responsible-disclosure policy. Do not include real
end-user identity data, API keys, or tokens in a report.

## Reporting an API or integration problem

For a failing call or an unexpected result, include the diagnostic details from
[Errors & troubleshooting](/docs/errors#contacting-support):

- the **`X-Request-Id`** header value from the failing response,
- the **session / event id** if the problem involves a verification (`session_id`, or the
  `event_id` from a webhook),
- a **timestamp** (with time zone), and
- the **endpoint** you called and the **environment** it ran against (each environment has its
  own IdP host).

**Never send** API keys, tokens, or the person's identity data — support will never ask for them.
Before opening a ticket, read the status first: a `4xx` is almost always an integration fix you can
make yourself (see the [error catalog](/docs/errors#3-complete-code-catalog)), while a persistent
`5xx` or a degraded-dependency signal (`engine_unreachable`, `face_match_unavailable`) is
Valyd-side — [retry with backoff](/docs/operations-sla#degraded-dependency-behavior) before
escalating.

## Channels & response targets (owner to confirm)

Each row below is a placeholder — Valyd does not commit to any of these until confirmed.

| Item | Value |
| --- | --- |
| Support channel | [owner: confirm — the support contact channel(s): email address, portal URL, or in-app, and where to reach each] |
| Support hours | [owner: confirm — support hours and time-zone coverage] |
| Support tiers / plans | [owner: confirm — whether support tiers or plans exist and what each includes] |
| First-response targets | [owner: confirm — first-response and resolution-time targets by severity] |
| Escalation path | [owner: confirm — the escalation path for a production-impacting incident, and how to reach it out of hours] |
| Status page | [owner: confirm — the public status page URL for live incident and maintenance updates] |
| Account / billing contact | [owner: confirm — the contact for non-technical questions (invoices, seats, plan changes)] |

The committed availability and SLA figures, once confirmed, live on
[Operations & SLA](/docs/operations-sla) — this page is only the *how to reach us* home.

## See also

- [Security disclosure](/docs/security-disclosure) — report a vulnerability
- [Errors & troubleshooting](/docs/errors) — read the error, then what to send
- [Operations & SLA](/docs/operations-sla) — uptime, status, incident comms
- [Audit logging](/docs/audit-logging) — the ids you quote when you ask for help
