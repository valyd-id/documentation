# Idempotency

Every **billable** verification `POST /api/v2/*` accepts an optional `Idempotency-Key` header. Send
one and a network retry can never double-run or double-charge the same check: Valyd runs the
operation once, records the result against your key, and returns that stored result for any later
request carrying the same key.

## Why it matters

Verification checks are real and billed against your app's wallet. If a request times out or your
connection drops, you cannot know whether the check ran. Retrying without an idempotency key risks
running — and charging — the check twice. Retrying **with** the same key is safe: the second request
returns the first request's outcome instead of starting a new check.

## Sending the header (raw HTTP)

Generate a unique key per logical operation (a UUID is ideal) and reuse it across retries of that
same operation:

```bash
curl -X POST https://idp.valyd.work/api/v2/liveness \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Idempotency-Key: 5f2c…-your-unique-id" \
  -F "image=@./selfie.jpg"
```

Applies to every billable `POST /api/v2/*` check — liveness, ID verification, face match, age,
credential lookups, and the rest listed under [Raw HTTP](/verifications/standalone/http).

## With the Node SDK

Pass `idempotencyKey` on any billable check and the SDK sends the `Idempotency-Key` header for you
(available since `@valyd/sdk` v1.10.2):

```javascript
const { check } = await verify.standalone.liveness({
  image,
  idempotencyKey: "5f2c…-your-unique-id",
});
```

See the [Node SDK reference](/verifications/sdk) for the full list of checks that accept
`idempotencyKey`.

## Rules of thumb

- **One key per operation, reused on retry.** A new operation gets a new key; a retry of the same
  operation reuses the original key.
- **Change any input, change the key.** Reusing a key with a different payload returns the original
  stored result, not a fresh run.
- **Keys are per app.** They are scoped to the App API key that issued the request.

## Related

- [Testing your integration](/docs/testing) — why checks are always real and billed.
- [Rate limits](/docs/rate-limits) — retry/backoff behaviour on `429`.
- [Raw HTTP](/verifications/standalone/http) — the raw request for every billable check.
