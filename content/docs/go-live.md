# Go-live checklist

Everything below is enforced or documented elsewhere in these docs — this page just puts it in
one place for the day you flip to production.

## Credentials

- [ ] **All secrets live server-side.** `client_secret`, tokens, the App API key (`X-API-Key`),
      and the webhook signing secret never enter browser code or client storage.
- [ ] **Separate production app.** Use a distinct app in the [Developer Portal](https://dev.valyd.work)
      for production, with its own key and workflows — never your test credentials.
- [ ] **Rotate keys you may have leaked** during development (the console can rotate the App API
      key and webhook signing secret).

## Login (OIDC)

- [ ] **Exact HTTPS redirect URI** registered — swap the `http://localhost` URI you used in
      development for your real callback URL, matched character-for-character.
- [ ] **State, nonce, and PKCE handled by the SDK** (`createAuthorizationRequest` →
      `handleCallback`). Never hand-roll them — the [complete example](/docs/quickstart/node) shows
      the pattern, including the server-side transaction store.
- [ ] **Production session config**: shared session store, `secure: true` cookies, correct
      trusted-proxy handling ([details](/docs/quick-start#five-minute-acceptance-check)).

## Verification results

- [ ] **Never trust the redirect `?status=` param** — it is a hint only. The authoritative
      outcome is the signed webhook and `GET /api/v2/session/{id}/decision`
      ([statuses](/verifications/statuses)).
- [ ] **Handle every terminal status**: `APPROVED` (grant), `DECLINED` (deny + retry path per your
      policy), `ABANDONED` / `EXPIRED` (treat as not verified; offer a new session), and the
      non-terminal `IN_REVIEW` (wait — do not grant access).
- [ ] **Send `Idempotency-Key`** on billable `POST /api/v2/*` calls so retries can't double-run
      or double-charge ([idempotency](/verifications/unique-human#idempotency)).

## Webhooks

- [ ] **Verify the HMAC signature on the RAW body** (`X-Valyd-Signature`,
      `HMAC_SHA256("{timestamp}.{rawBody}", secret)`, constant-time compare) — no JSON
      re-serialization ([webhooks](/verifications/webhooks)).
- [ ] **Reject stale timestamps** (> 5 minutes) for replay protection — `X-Valyd-Timestamp` is
      signed into the HMAC.
- [ ] **Deduplicate on `X-Valyd-Event-Id`.** Delivery is at-least-once; retries and manual
      resends carry the same event id.
- [ ] **Return 2xx fast**, defer heavy work to a queue — non-2xx deliveries are retried for
      ~2.5 hours.

## Data hygiene

- [ ] **Don't log PII.** Keep decision payloads (extracted ID fields, portraits) out of
      application logs; store only what your policy requires.
- [ ] **Prefer proofs over raw fields** — request `is_18_plus` rather than `dob`; raw identity
      data goes through the [consent flow](/docs/request-data) only.
- [ ] **Read sealed consent payloads promptly** — they are purged about 5 minutes after approval.

## Operations

- [ ] **Wallet funded** — checks are billed per call; an empty balance returns `402`
      ([errors](/docs/errors)).
- [ ] **Generous timeouts** for credential lookups (10–60 s; e.g. `timeoutMs: 90_000`).
- [ ] **Build defensively** for additive API changes: ignore unknown response fields and enum
      values, pin `/api/v2` ([versioning](/verifications/versioning)).
- [ ] **Subscribe to the [changelog](/docs/changelog)** for deprecation notices.
