# Pricing & billing

An organization pays **per seat** for its workforce, on one wallet and one ledger.

## The seat model

- **14-day free trial** — run verifications for your organization free for the first 14 days.
- **$0.99 per active member / month** after the trial — that covers **unlimited verifications** for
  that member (KYC, license, liveness, location, face match; verify them as often as you need).
- **You're billed only for `active` members.** A member becomes active the moment they **scan their
  face** (activate the invite) — that's when the seat turns on and billing starts for them. An
  invited person who hasn't scanned their face yet (`invited` / `link_sent`) is **free** and doesn't
  count. A `deactivated` member is free too. See the
  [member lifecycle](/docs/organizations/members#member-lifecycle-status).
- **Add or remove people anytime** — the bill follows your active roster.
- Verification checks and login stay on the **same single wallet and ledger** — one bill for
  everything.

## Read your seats & billing

`GET /api/sdk/billing` returns your subscription, active-seat count, next-charge estimate, wallet
balance, and invoices. It's authenticated like every [Organization API](/docs/organizations/api)
call — server-to-server with your `client_id` + `client_secret`.

```ts
const billing = await client.getBilling();
// { subscription, seats, estimated_next_charge, currency, balance, invoices }
```

```http
GET /api/sdk/billing HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

```json
{
  "success": true,
  "data": {
    "subscription": {
      "plan": "workforce",
      "status": "active",
      "price_per_seat": 0.99,
      "in_trial": false,
      "trial_ends_at": "2026-08-14T00:00:00+00:00",
      "current_period_end": "2026-09-01T00:00:00+00:00"
    },
    "seats": 12,
    "estimated_next_charge": 11.88,
    "currency": "USD",
    "balance": 4.20,
    "invoices": [
      { "period": "2026-07", "seats": 10, "amount": 9.90, "created_at": "2026-08-01T00:00:00+00:00" }
    ]
  }
}
```

Field notes:

- **`subscription`** — the plan (`plan`, `status`, `price_per_seat`, `in_trial`, `trial_ends_at`,
  `current_period_end`), or `null` before a plan exists.
- **`seats`** — the number of **active** members (the billable count).
- **`estimated_next_charge`** — `seats × price_per_seat`.
- **`currency`** — `"USD"`.
- **`balance`** — the wallet balance.
- **`invoices`** — past charges, each `{ period, seats, amount, created_at }`.
