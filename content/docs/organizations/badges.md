---
product: valyd-id
api_version: oidc
auth: client-credentials
billable: false
pii_mode: proofs
human_setup_required: true
source_of_truth: openapi
---

# Badges

A **badge** is an org-scoped label you define and attach to a person's Valyd identity — "Background
Check", "Licensed Contractor", "KYC Tier 2". You use badges two ways:

1. **Mark your workforce** — assign badges to your own members in the Developer Portal
   (**Organization → Members**).
2. **Verification reuse** — after someone passes a check on *your* site (e.g. a background check),
   you **grant** them a badge on their Valyd identity. Other apps can then trust that proof instead of
   re-running the check. This is the "Connect with Valyd → claim your badge" flow.

Every badge belongs to **one organization** and is managed **server-to-server** with your
`client_id` + `client_secret`, under the base path **`/api/sdk`** — the same credentials and envelope
as the [Organization API](/docs/organizations/api).

## Private vs public

Each badge has a **visibility** that controls who can see and trust it:

| `visibility` | Who can see it | Where it appears |
| --- | --- | --- |
| `private` *(default)* | **Only your org.** | Your own apps and API calls. Not shared with anyone else. |
| `public` | **Every relying app.** | Carried in the portable OIDC `badges` claim, so any app a user signs into can trust it (cross-org). |

New badges are **private** by default — a badge only becomes shareable across organizations when you
explicitly make it `public`. An **expired** badge is never deleted: it stays, marked `expired: true`,
and is excluded from cross-org sharing.

## The badge object

Wherever a badge appears in a response it has the same shape:

```jsonc
{
  "id": 12,                               // numeric — the badge_id you pass to grant/revoke
  "name": "Background Check",
  "visibility": "private",                // "private" | "public"
  "expiry_date": "2027-01-01",            // date, or null = never expires
  "expired": false,                       // true once expiry_date has passed
  "created_at": "2026-09-30T10:00:00+00:00"
}
```

- **`id`** — the numeric badge id. This is the `badge_id` you pass to **grant**, **revoke**, update
  and delete. Get it from [List badges](#list-badges) (or the portal).
- **`visibility`** — `private` or `public` (see [above](#private-vs-public)).
- **`expiry_date`** — an ISO date or `null`. Past-dated badges come back with `expired: true`.
- **`created_at`** — when the badge was created.

[List a user's badges](#list-a-users-badges) adds one more field, **`organization`** (the issuing
org), so a cross-org public badge names its trust anchor.

## Authentication

Every badge endpoint uses your organization app's **`client_id` + `client_secret`**, sent as request
headers and scoped to the org that owns the app. **Server-side only** — the secret must never reach a
browser. The `@valyd/sdk` client sends them for you.

```http
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
Content-Type: application/json
```

Responses use the standard envelope — `{ "success": true, "data": { … } }` on success,
`{ "success": false, "error": { "code", "message" } }` on error.

```ts
import { ValydClient } from "@valyd/sdk";

// Server-side only — the client secret never touches the browser.
const client = new ValydClient({
  clientId: process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET,
});
```

---

## List badges

Returns your organization's **badge catalog** — every badge you've created, with its id, visibility,
expiry and creation time. This is where you find the **`id`** to grant.

```ts
const { badges, organization } = await client.listBadges();
const backgroundCheck = badges.find((b) => b.name === "Background Check");
// backgroundCheck.id → pass as badge_id to grantBadge()
```

```http
GET /api/sdk/badges HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": 12,
        "name": "Background Check",
        "visibility": "private",
        "expiry_date": "2027-01-01",
        "expired": false,
        "created_at": "2026-09-30T10:00:00+00:00"
      },
      {
        "id": 13,
        "name": "Licensed Contractor",
        "visibility": "public",
        "expiry_date": null,
        "expired": false,
        "created_at": "2026-09-30T10:05:00+00:00"
      }
    ],
    "organization": { "id": 42, "name": "Acme, Inc." }
  }
}
```

## Create a badge

Create a badge in your org's catalog. `name` is required; `expiry_date` and `visibility` are
optional (`visibility` defaults to `private`).

```ts
const { badge } = await client.createBadge({
  name: "Background Check",
  expiryDate: "2027-01-01",   // optional; omit for no expiry
  visibility: "private",       // optional; "private" (default) | "public"
});
```

```http
POST /api/sdk/badges HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
Content-Type: application/json

{ "name": "Background Check", "expiry_date": "2027-01-01", "visibility": "private" }
```

```json
{
  "success": true,
  "data": {
    "badge": {
      "id": 12,
      "name": "Background Check",
      "visibility": "private",
      "expiry_date": "2027-01-01",
      "expired": false,
      "created_at": "2026-09-30T10:00:00+00:00"
    }
  }
}
```

**Errors** — `409 duplicate_badge` if a badge with that name (case-insensitive) already exists in
your org; `400 invalid_request` on a bad field.

## Update a badge

Change a badge's `name`, `expiry_date` and/or `visibility`. Send only the fields you want to change.

```ts
const { badge } = await client.updateBadge(12, { visibility: "public" });
```

```http
PATCH /api/sdk/badges/12 HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
Content-Type: application/json

{ "visibility": "public" }
```

Returns the updated [badge object](#the-badge-object). **Errors** — `404 not_found`,
`409 duplicate_badge`, `400 invalid_request`.

## Delete a badge

Delete a badge from your catalog. This **cascades**: the badge is removed from every member and every
user who held it.

```ts
await client.deleteBadge(12);
```

```http
DELETE /api/sdk/badges/12 HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

```json
{ "success": true, "data": { "deleted": true } }
```

**Errors** — `404 not_found`.

## Grant a badge

Offer one of your org's badges to a **Valyd user** by their `valyd_id`. This is the verification-reuse
step: a user passed a check on your site and connected their Valyd ID.

> **A grant is an _offer_, not an immediate assignment.** The badge is **not** added right away. The
> user gets a notification in their Valyd app and must **approve** it — and if their identity isn't
> **KYC-verified** yet, they complete a quick ID check first. Only then does the badge land on their
> account. So this call returns **`status: "pending"`**; the outcome happens on the user's device and
> there is **no callback** to your server.

`first_name` / `last_name` are optional and **display-only** — shown in the user's approval
notification.

```ts
const res = await client.grantBadge({
  valydId: "valyd_9f8e7d6c5b4a3210fedcba98",
  badgeId: 12,
  firstName: "Ada",     // optional, display-only
  lastName: "Lovelace", // optional, display-only
});
// res.status === "pending"  → offered, awaiting the user's approval
// res.status === "granted"  → the user already had it (nothing to do)
```

```http
POST /api/sdk/badges/grant HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
Content-Type: application/json

{ "valyd_id": "valyd_9f8e7d6c5b4a3210fedcba98", "badge_id": 12, "first_name": "Ada", "last_name": "Lovelace" }
```

A fresh offer — the user must approve it:

```json
{
  "success": true,
  "data": {
    "status": "pending",
    "granted": false,
    "request_id": "7b3f…",
    "valyd_id": "valyd_9f8e7d6c5b4a3210fedcba98",
    "badge": { "id": 12, "name": "Background Check", "visibility": "private", "expiry_date": "2027-01-01", "expired": false, "created_at": "2026-09-30T10:00:00+00:00" },
    "display": "Acme, Inc. Background Check"
  }
}
```

Already held — a no-op:

```json
{ "success": true, "data": { "status": "granted", "granted": true, "already_held": true, "valyd_id": "valyd_9f8e7d6c5b4a3210fedcba98", "badge": { "id": 12, "name": "Background Check", "visibility": "private", "expiry_date": "2027-01-01", "expired": false, "created_at": "2026-09-30T10:00:00+00:00" } } }
```

- **Identify the user** with `valyd_id` (their Valyd identity id — the OIDC `sub`). Email is **not**
  accepted here.
- **Identify the badge** with its numeric `badge_id` from [List badges](#list-badges).
- **Idempotent** — a user holds a badge at most once, and a repeat call while an offer is still
  pending **reuses** the open request (no duplicate notification).

> **The user must have connected to your app first.** A grant only succeeds for a user who has signed
> in to *your* application through Valyd (OAuth/OIDC) at least once. This stops a client from granting
> badges to arbitrary identities. If they haven't connected, the call returns **`403
> user_not_connected`** — send them through your "Connect with Valyd" flow, then grant.

**Errors** — `404 not_found` (badge isn't in your org), `403 user_not_connected`,
`400 invalid_request` (missing `valyd_id`/`badge_id`).

## Revoke a badge

Remove a granted badge from a user. Only removes the grant (the `user_badges` row) — staff badges
assigned through the member lifecycle are managed on the member, not here. Idempotent.

```ts
const { revoked } = await client.revokeBadge({ valydId: "valyd_9f8e7d6c5b4a3210fedcba98", badgeId: 12 });
```

```http
POST /api/sdk/badges/revoke HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
Content-Type: application/json

{ "valyd_id": "valyd_9f8e7d6c5b4a3210fedcba98", "badge_id": 12 }
```

```json
{ "success": true, "data": { "revoked": true } }
```

`revoked` is `false` if the user didn't hold that badge. **Errors** — `404 not_found`,
`400 invalid_request`.

## List a user's badges

List the badges a user holds that **you are allowed to see**: **all** of your own org's badges
(private + public) **plus** any other org's **public** badges — the same rule as the portable OIDC
`badges` claim. Each badge carries its issuing **`organization`** so a cross-org public badge names
its trust anchor. Sources both directly-granted badges and active staff badges.

```ts
const { badges } = await client.getUserBadges("valyd_9f8e7d6c5b4a3210fedcba98");
```

```http
GET /api/sdk/users/valyd_9f8e7d6c5b4a3210fedcba98/badges HTTP/1.1
Host: dev.valyd.work
X-Client-Id: <your client_id>
X-Client-Secret: <your client_secret>
```

```json
{
  "success": true,
  "data": {
    "valyd_id": "valyd_9f8e7d6c5b4a3210fedcba98",
    "badges": [
      {
        "id": 12,
        "name": "Background Check",
        "visibility": "private",
        "expiry_date": "2027-01-01",
        "expired": false,
        "created_at": "2026-09-30T10:00:00+00:00",
        "organization": { "id": 42, "name": "Acme, Inc." }
      }
    ]
  }
}
```

## Require a badge for login

Badges can **gate sign-in** to your private apps. In the Developer Portal, open your project, make it
**private**, and select one or more **required badges** — only users who hold **every** selected
badge can sign in through Valyd (staff membership plus granted badges both count). This is configured
in the portal, not this API; the requirement is enforced by Valyd at login.

## Typical flow: verification reuse

1. **Create the badge once** — in the portal or with [`createBadge()`](#create-a-badge); note its
   `id` (or read it later with [`listBadges()`](#list-badges)).
2. **User connects** — the person passes your check, then signs in to your app with Valyd (OAuth), so
   they're connected to your client.
3. **Offer** — call [`grantBadge({ valydId, badgeId, firstName, lastName })`](#grant-a-badge). This
   returns `status: "pending"` and notifies the user.
4. **User approves** — on their device they approve the offer (and complete KYC if their identity
   isn't verified yet). Only then is the badge added to their Valyd identity. You get no callback.
5. **Reuse** — once granted, if the badge is `public`, other apps see it in the user's `badges` claim;
   if you gate a private app on it, the badge lets the user straight in.

See the **Checkr** example app (`checkr/server`) for an end-to-end verification-reuse integration.
