---
product: valyd-id
api_version: oidc
auth: client-credentials
billable: true
pii_mode: proofs
human_setup_required: true
source_of_truth: openapi
---

# Organization API

Manage your workforce roster **server-to-server**. Add and invite members, look people up,
deactivate/reactivate, remove, re-send invites, and read your seats & billing — all under the base
path **`/api/sdk`**. Every call is made with your organization's `client_id` + `client_secret`, so
this API is **server-side only** — the secret must never reach a browser.

The examples below use the `@valyd/sdk` client and raw HTTP against
`https://dev.valyd.work/api/sdk`.

```ts
import { ValydClient } from "@valyd/sdk";

// Server-side only — the client secret never touches the browser.
const client = new ValydClient({
  clientId: process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET,
});
```

## Authentication

All endpoints authenticate with your organization app's **`client_id` + `client_secret`**, sent as
request headers (`X-Client-Id` / `X-Client-Secret`), scoped to the organization that owns the app.
The `@valyd/sdk` client sends them for you.

```http
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
Content-Type: application/json
```

## Response envelope

Every response is wrapped in a consistent envelope.

**Success (any 2xx):**

```json
{ "success": true, "data": { } }
```

**Error:**

```json
{ "success": false, "error": { "code": "…", "message": "…" }, "data": { } }
```

The per-endpoint examples below show what goes inside `data`.

## The member object

Wherever a member appears in a response, it is **the member object** — the same shape everywhere:

```jsonc
{
  "id": 123,
  "member_id": "vmem_1a2b3c4d5e6f7a8b9c0d1e2f", // stable public id = the valyd_org_member_id login claim; prefix vmem_ + 24 hex
  "first_name": "Ada",
  "last_name": "Lovelace",
  "email": "ada@acme.com",
  "role": "member",                 // one of: owner | admin | developer | member
  "status": "active",               // one of: invited | link_sent | active | deactivated
  "valyd_id": "usr_…",              // null until the member connects their Valyd ID (face)
  "active": true,                    // convenience: status === "active"
  "created_at": "2026-08-21T10:00:00+00:00"
}
```

- **`member_id`** — the stable public id (`vmem_` + 24 hex). It's the value of the
  `valyd_org_member_id` login claim, so it's your join key between your roster and Valyd's login
  layer. Wherever a path takes `{member_id}`, the member's **email** or **`valyd_id`** is also
  accepted.
- **`valyd_id`** — `null` until the member scans their face and connects their Valyd ID.
- **`active`** — a convenience boolean equal to `status === "active"`.

---

## List members

Returns your workforce roster (**`role: member`** only), each with status and `valyd_id`, plus the
organization it belongs to.

```ts
const { members, organization } = await client.getMembers();
const activated = members.filter((m) => m.status === "active");
```

```http
GET /api/sdk/members HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": 123,
        "member_id": "vmem_1a2b3c4d5e6f7a8b9c0d1e2f",
        "first_name": "Ada",
        "last_name": "Lovelace",
        "email": "ada@acme.com",
        "role": "member",
        "status": "active",
        "valyd_id": "usr_9f8e7d6c5b4a",
        "active": true,
        "created_at": "2026-08-21T10:00:00+00:00"
      }
    ],
    "organization": { "id": 42, "name": "Acme, Inc." }
  }
}
```

## Resolve one person

Look up **one** person's membership at **any** role — so you can tell "you're a developer here"
from "not in this org." Pass a `valyd_id` **or** an `email` (at least one).

```ts
const { found, member } = await client.resolveMember({ valydId: "usr_9f8e7d6c5b4a" });
// or: await client.resolveMember({ email: "ada@acme.com" });
```

```http
POST /api/sdk/members/resolve HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
Content-Type: application/json

{ "valyd_id": "usr_9f8e7d6c5b4a" }
```

```json
{
  "success": true,
  "data": {
    "found": true,
    "member": {
      "id": 123,
      "member_id": "vmem_1a2b3c4d5e6f7a8b9c0d1e2f",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada@acme.com",
      "role": "member",
      "status": "active",
      "valyd_id": "usr_9f8e7d6c5b4a",
      "active": true,
      "created_at": "2026-08-21T10:00:00+00:00"
    }
  }
}
```

Not in the organization returns `{ "found": false, "member": null }`.

**Errors** — `400 missing_identifier` when neither `valyd_id` nor `email` is given.

## Add member(s)

Add one or more people (1–500 per call). `email` is required per member; `first_name`, `last_name`,
and `role` (default `member`) are optional. Options: `notify` (default `true`) emails the invite;
`invite` (`auto` | `email` | `face`, default `auto`) picks the invite method — see
[Members & onboarding](/docs/organizations/members#how-a-member-is-invited). Returns **`201`**.

```ts
const { created, skipped, notified } = await client.addMembers(
  [
    { email: "jane@acme.com", firstName: "Jane", lastName: "Doe" },
    { email: "sam@acme.com" },
  ],
  { notify: true, invite: "auto" }
);
```

```http
POST /api/sdk/members HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
Content-Type: application/json

{
  "members": [
    { "email": "jane@acme.com", "first_name": "Jane", "last_name": "Doe" },
    { "email": "sam@acme.com" }
  ],
  "notify": true,
  "invite": "auto"
}
```

```json
{
  "success": true,
  "data": {
    "created": [
      {
        "id": 201,
        "member_id": "vmem_aa11bb22cc33dd44ee55ff66",
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane@acme.com",
        "role": "member",
        "status": "link_sent",
        "valyd_id": null,
        "active": false,
        "created_at": "2026-08-21T10:05:00+00:00",
        "activation_link": "https://idp.valyd.work/m/activate/xxxxxxxxxxxx",
        "invite_method": "face"
      }
    ],
    "skipped": [
      { "email": "sam@acme.com", "reason": "duplicate" }
    ],
    "notified": true
  }
}
```

Each `created` entry is a member object plus:

- **`activation_link`** — a string for **face** invites only; `null` otherwise. Email/claim links
  are emailed, never returned. Passing `notify: false` hands the face link back so you can deliver
  it yourself.
- **`invite_method`** — `"face"`, `"email"`, or `"none"`.
- **`reactivated`** — present and `true` when re-adding a previously **deactivated** email
  reactivates that person instead of skipping them.

**Errors** — `400 invalid_request`, with a per-field validation map in `data.errors`.

## Deactivate

Stops billing and revokes the member's app logins, but **keeps the row**. The person's Valyd
identity is **not** deleted.

```ts
const { member } = await client.deactivateMember("vmem_1a2b3c4d5e6f7a8b9c0d1e2f");
```

```http
PATCH /api/sdk/members/vmem_1a2b3c4d5e6f7a8b9c0d1e2f/deactivate HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

```json
{
  "success": true,
  "data": {
    "member": {
      "id": 123,
      "member_id": "vmem_1a2b3c4d5e6f7a8b9c0d1e2f",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada@acme.com",
      "role": "member",
      "status": "deactivated",
      "valyd_id": "usr_9f8e7d6c5b4a",
      "active": false,
      "created_at": "2026-08-21T10:00:00+00:00"
    }
  }
}
```

The path takes the `vmem_…` `member_id` (the member's email or `valyd_id` is also accepted).

## Remove

Removes a member. **Default** (no `permanent`) is the same as [deactivate](#deactivate). Pass
`permanent=true` to delete the membership row outright. The person's Valyd account is never deleted.

```ts
await client.removeMember("vmem_1a2b3c4d5e6f7a8b9c0d1e2f", { permanent: true });
```

```http
DELETE /api/sdk/members/vmem_1a2b3c4d5e6f7a8b9c0d1e2f?permanent=true HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

**Permanent delete** — the row is gone:

```json
{ "success": true, "data": { "member": null, "removed": true } }
```

**Default (deactivate)** — no `permanent` flag returns the deactivated member object:

```json
{
  "success": true,
  "data": {
    "member": {
      "id": 123,
      "member_id": "vmem_1a2b3c4d5e6f7a8b9c0d1e2f",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada@acme.com",
      "role": "member",
      "status": "deactivated",
      "valyd_id": "usr_9f8e7d6c5b4a",
      "active": false,
      "created_at": "2026-08-21T10:00:00+00:00"
    }
  }
}
```

**Already gone** — removing a member that no longer exists is idempotent:

```json
{ "success": true, "data": { "member": null, "already_removed": true } }
```

The path takes the `vmem_…` `member_id` (the member's email or `valyd_id` is also accepted).

## Reactivate

Restores a deactivated member to **`active`** if their Valyd identity still exists, or back to
**`invited`** (they must re-activate by face) if it doesn't.

```ts
const { member } = await client.reactivateMember("vmem_1a2b3c4d5e6f7a8b9c0d1e2f");
```

```http
PATCH /api/sdk/members/vmem_1a2b3c4d5e6f7a8b9c0d1e2f/reactivate HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

```json
{
  "success": true,
  "data": {
    "member": {
      "id": 123,
      "member_id": "vmem_1a2b3c4d5e6f7a8b9c0d1e2f",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada@acme.com",
      "role": "member",
      "status": "active",
      "valyd_id": "usr_9f8e7d6c5b4a",
      "active": true,
      "created_at": "2026-08-21T10:00:00+00:00"
    }
  }
}
```

The path takes the `vmem_…` `member_id` (the member's email or `valyd_id` is also accepted).

**Errors** — `404 not_found`.

## Re-send invite

Re-issues the member's **face-activation** link — it supersedes the old one, is emailed, and is also
returned in the response. Throttled to **10 requests / minute**.

```ts
const { member, activation_link } = await client.resendMemberInvite("vmem_1a2b3c4d5e6f7a8b9c0d1e2f");
```

```http
POST /api/sdk/members/vmem_1a2b3c4d5e6f7a8b9c0d1e2f/invite HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

```json
{
  "success": true,
  "data": {
    "member": {
      "id": 123,
      "member_id": "vmem_1a2b3c4d5e6f7a8b9c0d1e2f",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada@acme.com",
      "role": "member",
      "status": "link_sent",
      "valyd_id": null,
      "active": false,
      "created_at": "2026-08-21T10:00:00+00:00"
    },
    "activation_link": "https://idp.valyd.work/m/activate/yyyyyyyyyyyy"
  }
}
```

The path takes the `vmem_…` `member_id` (the member's email or `valyd_id` is also accepted).

**Errors** — `404 not_found`; `409 already_active` (the member already connected a Valyd ID);
`409 deactivated` (reactivate first).

## Billing & seats

Read your subscription, seat count, next-charge estimate, wallet balance, and invoices. Full seat
model on [Pricing & billing](/docs/organizations/billing).

```ts
const billing = await client.getBilling();
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

`subscription` is `null` before a plan exists. `seats` is the count of **active** members;
`estimated_next_charge` is `seats × price_per_seat`.
