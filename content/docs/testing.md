# Testing your integration

> Valyd verification is always real — there is no fake-result sandbox. The sandbox at
> [/sandbox](/sandbox) tests **login** with demo users; verification checks run for real.

## Testing login

**Connect with Valyd is always free** — connecting users, the OIDC flow, and reading account data
never cost anything, in development or production. Only verification checks are billed.

The [Try the APIs](/sandbox) playground runs the full OAuth 2.0 / OIDC flow against **demo users**
with shared test credentials — pick a demo user, choose scopes, and walk from authorization code
to `userinfo` without writing code. Use it to see exactly what your app will receive at login
before you register your own app.

For your own app, the [complete example](/docs/quickstart/node) runs on `localhost`:
`http://localhost:8080/callback` is a valid redirect URI for development — register it exactly in
the [Developer Portal](https://dev.valyd.work). For production, switch to your exact HTTPS
callback URL.

## Every new account starts with $100

![The Transactions page: wallet balance, welcome credit, and the top-up contact](/images/screenshots/portal-funds.png)

New developer accounts receive a **one-time $100 welcome credit** in the wallet, so you can build
and test against real verification before adding funds. When you need more, email
[javi@valyd.id](mailto:javi@valyd.id) from your account email — top-ups are applied by an
administrator and show up in your Transactions ledger.

## Verification checks are real (and billed)

There are no simulated verification results. When you call a
[Unique Human API](/verifications/unique-human) endpoint, or a workflow runs a license lookup or
any other check, the real
pipeline runs — against the real face models and the real license registries — and the call is
[billed against your app](/verifications/api-reference). That's deliberate: a decision you can
trust in production is the same decision you saw in testing.

Practical consequences:

- **Watch your wallet balance** in the [Developer Portal](https://dev.valyd.work) — an exhausted
  balance returns [`402 Payment required`](/docs/errors); top up in the console.
- **Use the `Idempotency-Key` header** on every billable `POST /api/v2/*` so a network retry can
  never double-run or double-charge a check — see
  [Idempotency](/verifications/unique-human#idempotency).
- **Test with real inputs**: your own ID and selfie, or a real license number. A failed check is
  a real failure worth reading — inspect `check.error` and the
  [decision breakdown](/verifications/statuses).
- **Clean up test faces**: `DELETE /api/v2/face-uniqueness/{valyd_uuid}` removes a face you
  enrolled during testing from the gallery.

## Separate test and production apps

Create **separate apps** in the Developer Portal (e.g. "Test" and "Production") so each has its
own `client_id`/`client_secret`, App API key, workflows, and webhook endpoint. Rotate or revoke
the test app's key without touching production.

This documentation environment talks to `https://idp.valyd.work`. Each Valyd environment has its
own hosts and its own credentials — an app registered in one environment does not exist in
another, so keep per-environment values in your `.env` (as the
[complete example](/docs/quickstart/node) does with `VALYD_IDP_URL`).

## Testing webhooks

![The Webhook Tester in the app's verification settings](/images/screenshots/portal-webhook-tester.png)

Webhooks need a **publicly reachable HTTPS endpoint**. Two tools cover every case:

**Webhook Tester (Developer Portal).** In your app's webhook settings, send a simulated decision
event — Approved, Declined, In review, or Expired — straight to your registered URL. Test events
are signed with your **real signing secret** (so your verification code genuinely runs) and carry
`"test": true` at the top level with a `sess_test_…` id — they never create or modify real
verifications. Two extra modes exercise your handler's defenses:

- **Send duplicate** — the same event id delivered twice; your handler should process it once.
- **Send bad signature** — an invalid signature; your handler must reject it (400), never 200.

The result (status code, latency, response excerpt) is shown inline in the portal.

**Real deliveries.** Run a real verification session to a terminal state and confirm your handler
returns 200. Every delivery attempt (payload, headers, receiver response) is recorded under
**Recent webhook deliveries**, with a **Resend** button to replay one after you fix your handler.
See [Webhooks](/verifications/webhooks).

> **Testing principle:** Valyd may simulate *integration* behavior (a test webhook can say
> `declined`), but Valyd never fabricates *verification* — a simulated event can never become a
> real proof, credential result, or verified identity.
