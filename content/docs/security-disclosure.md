# Security disclosure

How to report a security vulnerability in Valyd. Valyd's public documentation does not yet
publish a security contact or a formal disclosure policy, so the contact details below are
placeholders for the owner to supply. This page is also the natural home for the recommended
`security.txt` file.

## Reporting a vulnerability

| Item | Value |
| --- | --- |
| Security contact | [owner: confirm — security contact email or intake form (e.g. security@…)] |
| Encryption key for reports | [owner: confirm — PGP key or secure-intake option for sensitive reports, if offered] |
| Acknowledgement target | [owner: confirm — how quickly a report is acknowledged] |
| Disclosure policy | [owner: confirm — coordinated-disclosure timeline and safe-harbor language] |
| Bug bounty | [owner: confirm — whether a bug-bounty or reward program exists and where it is hosted] |

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
Contact: mailto:[owner: confirm — security contact email]
Expires: [owner: confirm — expiry date, ISO 8601]
Policy: [owner: confirm — URL of the full disclosure policy]
Preferred-Languages: en
```

- Serve it over HTTPS at `/.well-known/security.txt`.
- Keep the `Expires` field current (RFC 9116 requires it).
- [owner: confirm — on which domains the `security.txt` will be hosted].

## See also

- [Trust Center](/docs/security-trust)
- [Operations & SLA](/docs/operations-sla)
- [Errors & troubleshooting](/docs/errors)
