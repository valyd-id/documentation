# Rate limits

How Valyd throttles requests, what a `429` looks like, and how to back off. The Verification
API limit below is confirmed from the published OpenAPI spec (`public/openapi/valyd-verify.json`);
per-endpoint limits for the login / OIDC / Account APIs are not published in these docs —
contact **support@valyd.id** if you need them for capacity planning.

## Verification API (`/api/v2/…`)

All `/api/v2` routes are rate limited **per client IP** at **~150 requests / minute**. This
covers both standalone check endpoints and hosted-session calls.

A throttled request returns `429` with this body — and, importantly, **no `Retry-After`
header**:

```json
{ "success": false, "data": [], "error": { "code": "rate_limited", "message": "..." } }
```

- The `429` response carries **no `Retry-After` and no `X-RateLimit-*` headers**.
- **Successful** responses include `X-RateLimit-Limit` and `X-RateLimit-Remaining`, so you
  can watch your remaining budget and slow down before you hit the wall.

| Limit | Value |
| --- | --- |
| Scope | Per client IP |
| Rate | ~150 requests / minute |
| `Retry-After` on 429 | Not sent |
| Budget headers | `X-RateLimit-Limit` / `X-RateLimit-Remaining` on successful responses |
| Concurrency cap | Not published — contact **support@valyd.id** |
| Burst allowance | Not published — contact **support@valyd.id** |

## Login / OIDC / Account APIs (`/api/auth/…`)

Per-endpoint request-rate limits for the authentication and Account APIs are not published
in these docs. What the error catalog does confirm is that abuse-sensitive flows are
throttled and return `429`:

- `rate_limited` (429) — back off and retry after the window resets.
- `too_many_attempts` (429) — too many failed face checks.

| Endpoint group | Limit |
| --- | --- |
| OAuth authorize / token / refresh | Not published — contact **support@valyd.id** |
| `userinfo` / Account API reads | Not published — contact **support@valyd.id** |
| Overall burst / concurrency for `/api/auth` | Not published — contact **support@valyd.id** |

## Handling 429 — back off

When you receive a `429`:

1. **Stop and wait** — do not retry immediately.
2. **Back off exponentially** — because the Verification API sends no `Retry-After`, use
   client-side exponential backoff with jitter (e.g. 1s, 2s, 4s, …) rather than a fixed
   delay.
3. **Watch your budget** — on the Verification API, read `X-RateLimit-Remaining` on
   successful responses and throttle yourself before you exhaust it.
4. **Use idempotency for retries** — Verify POST endpoints accept an optional
   `Idempotency-Key` header so a retry cannot double-run or double-charge (see the codes
   `idempotency_in_progress` and `idempotency_key_reused` in the
   [error catalog](/docs/errors#3-complete-code-catalog)).

General guidance on `429` and the status categories lives in
[Errors & troubleshooting](/docs/errors#2-what-the-http-status-means).

## See also

- [Errors & troubleshooting](/docs/errors)
- [Operations & SLA](/docs/operations-sla)
- [Full OpenAPI spec](/docs/api-reference)
