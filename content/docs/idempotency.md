# Idempotency

Every **billable** verification the SDK runs accepts an optional `idempotencyKey`. Send
one and a network retry can never double-run or double-charge the same check: Valyd runs the
operation once, records the result against your key, and returns that stored result for any later
request carrying the same key.

## Why it matters

Verification checks are real and billed against your app's wallet. If a request times out or your
connection drops, you cannot know whether the check ran. Retrying without an idempotency key risks
running — and charging — the check twice. Retrying **with** the same key is safe: the second request
returns the first request's outcome instead of starting a new check.

## With the Node SDK

Generate a unique key per logical operation (a UUID is ideal) and reuse it across retries of that
same operation. Pass `idempotencyKey` on any billable check and the SDK carries it for you:

```javascript
const session = await verify.sessions.create({
  workflowId,
  redirectUrl: "https://yourapp.com/checked",
  idempotencyKey: "5f2c…-your-unique-id",
});
```

Applies to every billable verification the SDK runs — session creation for both the
[Unique Human API](/verifications/standalone) and
[Reusable Verification](/verifications). (All checks — liveness, uniqueness, ID/KYC, face match,
age, professional license, location — run as [workflow checks](/verifications/types) on a
session, not as direct calls.)

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
- [Liveness (anti-spoof)](/verifications/standalone/antispoof) — the Unique Human API's anti-spoof check.
