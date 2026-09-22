---
product: valyd-id
api_version: oidc
auth: client-credentials
billable: true
pii_mode: proofs
human_setup_required: true
source_of_truth: manual
---

# Account Recovery

Let a locked-out member of your organization regain access by **re-verifying their identity with
Valyd** — **without Valyd ever storing or resetting your passwords**. Valyd verifies the person
(liveness + a face match against the face they enrolled, plus a fresh document/KYC check when you
ask for it) and returns a **pass/fail** decision on your Verify webhook. On a pass, you permit the
reset in **your own** system.

This is the right tool when your app uses **email/password** (or any credential you own) and a user
forgets it: instead of a knowledge-based reset, you get a **biometric identity proof** that the
person asking is the same Valyd account.

> This is **not** the Valyd end-user "recovery phrase" (E2E vault) flow. It is a server-to-server API
> for organization apps that manage their own credentials, under the same `/api/sdk` surface as the
> [Organization API](/docs/organizations/api).

## Prerequisites

- The member must be a **claimed, active member** of your org with a **`valyd_id` and an enrolled
  face** on file. Members onboarded through [Workforce onboarding](/docs/organizations/onboarding) —
  who scan a face-activation link once — qualify. Never-claimed or faceless members are **not**
  recoverable (fail-closed).
- You have your app's `clientId` / `clientSecret` and a Verify **project with a webhook** configured
  (the recovery result is delivered to that webhook).

## Flow

```
1. User can't sign in → your "Forgot password" (or an admin action) resolves their valyd_id.
2. Your server calls  startAccountRecovery({ valydId })  → Valyd starts a session and returns a
   hosted recoveryUrl. YOU deliver it to the member (your email / SMS / in-app). Optionally pass
   deliverEmail:true to also have Valyd email it to the member's on-file address.
3. The member opens the link → completes liveness + a face match against their on-file Valyd
   face (and a fresh document/KYC scan when variant is "with_id").
4. Valyd sends a signed webhook to your PROJECT webhook → verify.approved  or  verify.declined.
5. On approved, YOUR app lets the user set a new password. Valyd sets nothing.
```

## How members become recoverable

A member becomes recoverable **automatically** when they connect a Valyd identity through a
**face-activation link** — a [Workforce invite](/docs/organizations/onboarding), or
[`resendMemberInvite`](/docs/organizations/api#re-send-invite) with `notify: false` behind an in-app
"Connect with Valyd" button. Scanning the link binds their `valyd_id` to the membership and enrolls
their face in one step, so no separate registration call is needed — the moment they show as
`active` with a `valyd_id`, `startAccountRecovery` works for them.

## Start a recovery

### `startAccountRecovery`

```ts
import { ValydClient } from "@valyd/sdk";

// Server-side only — the same client you use for the Organization API.
const client = new ValydClient({
  clientId: process.env.VALYD_CLIENT_ID!,
  clientSecret: process.env.VALYD_CLIENT_SECRET!,
});

const rec = await client.startAccountRecovery({
  valydId: "valyd_…",                       // the member's Valyd id
  variant: "with_id",                        // "with_id" (default) or "without_id" — see below
  redirectUrl: "https://acme.com/reset",     // where the user lands after verifying
  // deliverEmail: true,                      // OPTIONAL — also have Valyd email the link
});

if (!rec.eligible) {
  // Fail-closed: unknown / inactive / unclaimed member. Show a GENERIC
  // "if an account exists, we've started recovery" message (avoid enumeration).
  return;
}

// Deliver the hosted link yourself (your email / SMS / in-app):
await sendYourOwnEmail(memberEmail, rec.recoveryUrl);
// …or pass deliverEmail:true above and Valyd emails the member's on-file address for you.
// Then wait for the webhook (or poll the session) to learn the outcome.
```

`POST /api/sdk/recovery/session` takes the member's `valydId` and returns
`{ eligible, recoveryUrl, emailed, sessionId, status, expiresAt }`. `recoveryUrl` is returned only to
your **authenticated server** (client-credentials) — you own the user relationship, so you own
delivery. Pass `deliverEmail:true` to also have Valyd email it to the member's on-file address; the
app name in that email is your **organization's name**, derived from your client credentials.

| Field | Meaning |
|---|---|
| `eligible` | `false` when no claimed, active, face-enrolled member matched — no session was started. |
| `recoveryUrl` | The verification link — deliver it to the member yourself. Never expose it to an unauthenticated end user. |
| `emailed` | `true` only when you passed `deliverEmail:true` and Valyd emailed the member the link. |
| `sessionId` | The Verify session id — correlate it to the webhook. |
| `status` | Initial session status (`NOT_STARTED`). |
| `expiresAt` | When the session/link expires. |

### Verification depth — `variant`

| Variant | Steps the member completes |
|---|---|
| `with_id` *(default)* | **Fresh document verification (KYC)** + **liveness** + **face match** against their on-file Valyd face. The government ID is re-scanned **every time** — prior KYC is **not** reused. |
| `without_id` | **Liveness** + **face match** against their on-file Valyd face. **No ID** is collected — even for a member who was never KYC-verified. |

Both variants match the live face against the **account's enrolled face**, never against a
self-supplied document. Use `with_id` when you want a government-ID-backed recovery each time; use
`without_id` for a lighter biometric-only proof that the person is the account holder.

## Handle the outcome

The result is delivered to your **Verify project's configured webhook** (the same one you use for
verifications) — verify the signature with your Verify client:

```ts
import { VerifyClient } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey: process.env.VERIFY_API_KEY!,
  webhookSecret: process.env.VERIFY_WEBHOOK_SECRET!,
});

const event = verify.webhooks.constructEvent(rawBody, req.headers);

// Correlate by the sessionId you got from startAccountRecovery.
if (event.status === "APPROVED") {
  // Identity re-verified → permit the user to set a new password in YOUR system.
} else {
  // Declined → do not allow the reset.
}
```

To make the flow robust to webhook timing, you can also **poll** the session decision on the page
the user returns to (`redirectUrl`) and treat `APPROVED` as the go-ahead — the webhook and the poll
agree on the same decision.

## Security

- **Fail closed** everywhere: no claimed/face-enrolled match → no session; no face match → `DECLINED`.
- Valyd stores/sets **no** passwords — it only returns the pass/fail decision.
- `recoveryUrl` is only ever returned to your **authenticated server** (client-credentials) — never
  expose it to an unauthenticated end user. When you pass `deliverEmail:true`, Valyd emails the link
  only to the address already **on file**, never to a caller-supplied one.
- The start endpoint is **rate-limited**. Return a **generic** response whether or not an account
  exists, so this can't be used to probe which members are registered.
- `startAccountRecovery` is **server-to-server** — the client secret must never reach a browser.
