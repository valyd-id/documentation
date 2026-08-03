> Source: https://docs.valyd.work/docs/organizations
> Part of: Valyd Developer documentation — static copy generated for AI agents
> Generated from repo component: OrganizationsSection.tsx

# Organizations & teams

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/organizations
- Credentials / env vars needed: to READ or WRITE members programmatically you need an app's `client_id` + `client_secret` (server-side only). Portal actions are human web steps.
- Package: `@valyd/sdk` (Node, server-side) — `npm i @valyd/sdk`
- Can complete without human input: PARTIAL — adding/listing members and reading billing is a real API (`/api/sdk/*`); creating an org, inviting teammates, CSV upload, deactivation and private-app assignment are portal steps.
- Prerequisites: a Valyd account, and an app whose credentials you use for the Members API.

Every Valyd account has its own **personal apps** and can create or join **any number of
organizations** (there is no "individual vs company" account type). An organization is a shared
tenant — a team, roles, a face-verified workforce, and public or private apps — governed by one
billing account. You manage its members from the developer portal **or programmatically via the
Members API**.

## Roles

- **Owner / Admin** — sees and manages everything: the organization, its team, members, apps and
  billing. Can assign roles and add people (admin, developer, or member).
- **Developer** — signs in, sees the organizations they belong to, and creates & manages apps. No
  member or billing administration.
- **Member** — the workforce. Does **not** see the organization at all; a member exists only to log
  into the apps assigned to them, by face.

## What an organization gives you

- **Teams & roles** — invite teammates and give each a role; clear separation between who builds and
  who administers.
- **Shared apps** — apps belong to the organization, not one person. Any developer on the team can
  manage them; ownership does not leave when a person does.
- **Workforce by face** — add members by CSV, one at a time, or via the API. Each gets a link and
  joins by scanning their face — no passwords. Only **active** (face-activated) members are billable.
- **Public & private apps** — a **public** app lets anyone log in (the default). A **private** app is
  scoped to specific members: only assigned members can sign in, enforced at the login gate.
- **One billing account** — pay-as-you-go usage and per-seat subscriptions post to a single wallet
  and ledger. Multiple products, billed from one place.

## Manage members via the API (server-to-server)

Authenticated with your app's `client_id` + `client_secret` (headers `X-Client-Id` / `X-Client-Secret`,
or HTTP Basic), scoped to the organization that owns the app. **Server-side only** — the secret must
never reach a browser. Everything you can do:

| Operation | SDK (`@valyd/sdk`) | REST |
|---|---|---|
| **List members** (status + valyd_id) | `client.getMembers()` | `GET /api/sdk/members` |
| **Add a member** (emails a face-activation link) | `client.addMembers([{ email, firstName, lastName }])` | `POST /api/sdk/members` |
| **Add many** (bulk, up to 500; dupes → `skipped`) | `client.addMembers([ …up to 500 ])` | `POST /api/sdk/members` |
| **Invite silently** (no email; returns each `activationLink`) | `client.addMembers([…], { notify: false })` | `POST /api/sdk/members` with `notify:false` |
| **Remove a member** (deactivate + revoke app login; Valyd account NOT deleted) | `client.removeMember(memberId)` | `DELETE /api/sdk/members/{memberId}` |
| **Billing & seats** (seat count, price, balance, invoices) | `client.getBilling()` | `GET /api/sdk/billing` |

```ts
import { ValydClient } from "@valyd/sdk";

// Server-side only — the client secret never touches the browser.
const client = new ValydClient({
  clientId: process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET,
});

// Add members — Valyd emails each a face-activation link.
const { created, skipped } = await client.addMembers([
  { email: "jane@acme.com", firstName: "Jane", lastName: "Doe" },
  { email: "sam@acme.com" },
]);

// List the roster with status + valyd_id.
const members = await client.getMembers();
// [{ id, firstName, lastName, email, status, valydId, active }]
const activated = members.filter((m) => m.status === "active");

// Seats + wallet.
const billing = await client.getBilling(); // { seats, pricePerSeat, balance, … }
```

Raw REST add:

```bash
curl -X POST https://dev.valyd.work/api/sdk/members \
  -H "X-Client-Id: $VALYD_CLIENT_ID" \
  -H "X-Client-Secret: $VALYD_CLIENT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"members":[{"email":"jane@acme.com","first_name":"Jane","last_name":"Doe"}],"notify":true}'
# → { "success": true, "data": { "created": [...], "skipped": [], "notified": true } }
```

### Member lifecycle (status)

- `invited` — created, no email sent yet (the `notify:false` path).
- `link_sent` — activation email sent, awaiting the person.
- `active` — face-activated and bound to a Valyd identity — the only **billable** state.
- `deactivated` — removed from the workforce; not billable.

Result sync is by **polling** `getMembers()`. CSV upload is a portal action. `removeMember()`
deactivates the membership + revokes app login but **never deletes the person's Valyd account**.

### Correlate a returning login to the member you added

Each member has a stable **`memberId`** (`vmem_…`), available the moment you add them — **before** they
activate. Store it against your own user. When that person later signs in with **Login with Valyd**,
your org app receives it back as an OIDC claim, so you match deterministically on the **first** login
(no polling):

```ts
// add-time — store our id against your user
const { created } = await client.addMembers([{ email: "jane@acme.com" }]);
saveMemberId(myUser, created[0].memberId);        // "vmem_…"

// login — the ID token / userinfo carry the same id (profile scope)
const { user } = await valyd.auth.exchangeCode(code);
user.valyd_org_member_id;   // "vmem_…" — equals the memberId you stored
// user.valyd_id (the person's uuid) is also present for persisting across future logins
```

Make the app **private** and assign members if you want to guarantee only your members can sign in —
then every login is a member and the claim tells you which.

## How to start

1. Sign in to the developer portal (https://dev.valyd.work) and open the **Organizations** tab.
2. Create an organization from the selector — you become its owner.
3. Invite teammates (developer or admin) and create apps under the organization.
4. Add members (your workforce) by CSV, singly, or with `addMembers()`; they join by scanning their face.
5. Mark apps public or private, and assign members to the private ones.

## Notes for integrators

- Organizations do not change the login/verification API surface. Your app still uses the same OAuth
  `client_id` / `client_secret` for Login with Valyd and the same App API key for the Verification
  APIs — an organization governs **who owns the app**, **who may log into it**, and gives you the
  **Members API** for workforce onboarding.
- For a **private** org app, a user who is not an assigned member is refused at the OAuth authorize
  step. Public apps behave exactly as before.
