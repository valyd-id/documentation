# Security disclosure

How to report a security vulnerability in Valyd. Report security issues to
**security@valyd.id** — we acknowledge valid reports and coordinate disclosure with the
reporter. This page is also the home for Valyd's `security.txt`.

## Reporting a vulnerability

| Item | Value |
| --- | --- |
| Security contact | **security@valyd.id** |
| Encryption key for reports | Not currently offered — email **security@valyd.id** and we will arrange a secure channel if needed |
| Acknowledgement target | We acknowledge valid reports and follow up with the reporter (no fixed public SLA) |
| Disclosure policy | Coordinated disclosure — we ask for reasonable time to remediate before public disclosure |
| Bug bounty | No public bug-bounty program at this time — report directly to **security@valyd.id** |

## What to include

To speed triage, a report should include:

- a clear description of the issue and its impact,
- reproduction steps or a proof of concept,
- the affected endpoint or surface, and
- any relevant `X-Request-Id` values (see [Errors & troubleshooting](/docs/errors#contacting-support)).

Do **not** include real end-user identity data, API keys, or tokens in a report.

## Recommended: publish a `security.txt`

Valyd should publish a machine-readable disclosure policy at the well-known location
`/.well-known/security.txt` (RFC 9116) on its primary domains, so researchers can find the
right contact without guessing. A minimal file looks like:

```text
Contact: mailto:security@valyd.id
Expires: <ISO 8601 expiry date>
Policy: <URL of the published disclosure policy>
Preferred-Languages: en
```

- Serve it over HTTPS at `/.well-known/security.txt`.
- Keep the `Expires` field current (RFC 9116 requires it).
- Valyd serves it on its primary product domains; contact **security@valyd.id** if you cannot
  locate it.

## See also

- [Trust Center](/docs/security-trust)
- [Operations & SLA](/docs/operations-sla)
- [Errors & troubleshooting](/docs/errors)
