---
product: valyd-id
api_version: oidc
sdk_min_version: 1.10.3
auth: client-credentials
billable: true
pii_mode: proofs
human_setup_required: true
source_of_truth: openapi
---

# Organizations & teams

An **organization** is a shared Valyd workspace for a company: one team, one set of apps, one
workforce roster, one bill. Solo developers don't need one — every account works standalone.
Create an organization when more than one person manages your apps, when apps should outlive any
single person's account, or when you onboard a workforce whose members sign in by face.

**New here? See [how organizations work](#how-organizations-work) and how to integrate.**

## How organizations work

Your company already runs on its own people — employees, staff, contractors — each with **your**
roles and permissions in **your** system. Valyd doesn't replace any of that. It adds a **verified
face-identity and verification layer** on top, so the same people sign into your apps by face and
carry reusable proofs of who they are.

Here's the flow — it's how real integrations work (e.g. how Cisive onboarded their workforce):

1. **Create an organization** and add your people as **members** — one at a time, by CSV upload, or
   over the [members API/SDK](#manage-members-via-the-api-server-to-server). No passwords to issue.
   Each member you add gets a stable **member id `vmem_…`** (the org member key) — store it against
   your own employee/user record; it's your correlation key between your roster and Valyd.
2. **Each member gets an email invite** — a face-activation link. They tap it and **scan their face
   once**, which binds the membership to a real Valyd identity.
3. **From then on they sign in by face.** Your apps use **Login with Valyd**, so the very face the
   member activated with is how they authenticate into your tools — no passwords, on Valyd's IdP.
   When that member signs in, the **`valyd_org_member_id`** claim comes back on the OIDC
   [userinfo response](/docs/endpoints#get-userinfo--get-user-profile) and in the ID token (scoped
   to your org's client) — its value is that member's `vmem_…` id, so you always know exactly which
   of your people just logged in, and can track logins against your own records.
4. **Layer verification on top.** For any member you can run **Valyd verification** — KYC,
   professional license, liveness, location — tied to their identity and reusable across your apps,
   so you don't re-collect it every time.

**Map your existing roles onto members.** Add **all** your people — employees, staff, contractors —
as **members** (they log in by face). On top of that, promote specific people to **admin** or
**developer**, who manage things in the Valyd **Developer Portal** — the organization, apps,
workflows, and billing — while plain members only face-login to your apps and never see the
organization. Keep your own business roles and permissions in **your** system; the
`valyd_org_member_id` is the **join key** between your roles and Valyd's identity/login layer.
Valyd's `member` role means only "can face-login to these apps." And with **private apps** you
scope an app to assigned members only (enforced right at the login gate), so **only your workforce
can sign in** — while a **public** app lets anyone log in.

### Why use an organization

- **A verified workforce** — every active member is a real, face-activated Valyd identity, not just
  an email on a list.
- **Face login, no passwords** — members sign in by scanning their face; nothing to reset or leak.
- **Reuse identity across your apps** — proofs a member earns (KYC, license, liveness) carry over;
  verify once, read everywhere.
- **Track exactly who logs in** — the `valyd_org_member_id` claim (that member's `vmem_…` id) comes
  back on every login, so you always know which of your people authenticated.
- **One bill** — a 14-day verification trial, then **$0.99 per active member / month** for unlimited verifications; usage and seats post to a single wallet ([pricing](#pricing)).
- **Private apps scoped to your people** — a private app only admits assigned members, enforced at
  the login gate.
- **Onboard & offboard over the API** — add, invite, deactivate, and remove members server-to-server
  as your roster changes.

### Pricing

- **14-day free trial** — run verifications for your organization free for the first 14 days.
- **$0.99 per active member / month** after the trial — that covers **unlimited verifications**
  for that member (KYC, license, liveness, location, face match; verify them as often as you need).
  You're billed only for **active** members. A member becomes active the moment they **scan their
  face** (activate the invite) — that's when the seat turns on and billing starts for them. An
  invited person who hasn't scanned their face yet is **free** and doesn't count. Add or remove
  people anytime; the bill follows your active roster.
- Verification checks and login stay on the same single wallet and ledger — one bill for
  everything.

### How to integrate

1. **Add the login button** — wire [Login with Valyd](/docs) into your app so members authenticate
   by face with the identity they activated.
2. **Add your people** — push your roster with the [members API](#manage-members-via-the-api-server-to-server)
   (or CSV / one at a time in the portal); each member gets a face-activation invite.
3. **Scope who gets in** — mark the app [private](#what-an-organization-gives-you) and assign members
   so only your workforce can sign in.

## Roles

- **Owner / Admin** — sees and manages everything: the organization, its team, members, apps and
  billing. Can assign roles and add people (admin, developer, or member).
- **Developer** — signs in, sees the organizations they belong to, and creates & manages apps. No
  member or billing administration.
- **Member** — the workforce. Does **not** see the organization at all; a member exists only to log
  into the apps assigned to them, by face.

**Assigning & changing roles:** an owner/admin does it in the portal — **Organization → Team**
for staff (admin/developer), **Organization → Members** for the workforce. Every mutation is
admin-gated; developers and members can't change anyone's role.

## What an organization gives you

![An organization in the Developer Portal: seats, members, team, and shared apps](/images/screenshots/portal-organization.png)

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
| **Look up one person** (role + status, at any role) | `client.resolveMember({ valydId })` / `{ email }` | `POST /api/sdk/members/resolve` |
| **Deactivate a member** (revoke app login; recoverable) | `client.deactivateMember(memberId)` | `PATCH /api/sdk/members/{memberId}/deactivate` |
| **Remove a member** (default = deactivate; `permanent` deletes the membership) | `client.removeMember(memberId, { permanent: true })` | `DELETE /api/sdk/members/{memberId}?permanent=true` |
| **Reactivate a member** | `client.reactivateMember(memberId)` | `PATCH /api/sdk/members/{memberId}/reactivate` |
| **Re-send an activation invite** (Valyd ID not connected yet / link expired) | `client.resendMemberInvite(memberId)` | `POST /api/sdk/members/{memberId}/invite` |
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

### How a new member is notified

Adding a member (portal, CSV, or `addMembers()`) emails them a **face-activation link** — they
tap it, scan their face once, and their membership is bound to a real Valyd identity. Prefer to
deliver it yourself (your own email/SMS/in-app message)? Pass `notify: false` and each created
member comes back with its `activationLink`. Re-send anytime with `resendMemberInvite(memberId)`.
To know when someone finished, poll `getMembers()` and watch for `status: "active"`.

### Member lifecycle (status)

- `invited` — created, no email sent yet (the `notify:false` path).
- `link_sent` — activation email sent, awaiting the person.
- `active` — face-activated and bound to a Valyd identity — the only **billable** state.
- `deactivated` — removed from the workforce; not billable.

Deactivate/reactivate over the API with `deactivateMember(memberId)` / `reactivateMember(memberId)`
(each accepts the member's `memberId` `vmem_…`, their Valyd ID, or their email).
`removeMember(memberId)` is the same deactivation by default; pass `{ permanent: true }` to delete
the membership row outright — the seat and history go and the email can be re-invited cleanly.
None of these ever touch the person's Valyd identity or their membership in any other org.
`reactivateMember` restores a deactivated member to `active` (or `invited` if they never activated).
If a member's invite expired before they connected their Valyd ID, `resendMemberInvite(memberId)`
issues + emails a fresh activation link (and returns it), superseding the old one; it refuses for
already-active or deactivated members. Only `member`-role people are affected — use
`resolveMember({ valydId })` to check whether someone is a workforce member vs a developer/admin.
Result sync is by **polling** `getMembers()`. CSV upload is a portal action.

In the developer portal, the org owner/admin sees the full roster with each member's status on the
**Organization → Members** tab, and can re-send invites, deactivate/reactivate, or **Remove** a
member outright (permanent, same as the API's `permanent:true`).

## How to start

1. Sign in to the developer portal (https://dev.valyd.work) and open the **Organizations** tab.
2. Create an organization from the selector — you become its owner.
3. Invite teammates (developer or admin) and create apps under the organization.
4. Add members (your workforce) by CSV, singly, or with `addMembers()`; they join by scanning their face.
5. Mark apps public or private, and assign members to the private ones.

## Account recovery — coming soon

If a member loses access to their Valyd identity (new phone, device lost), an org-assisted
**recovery** flow is on the roadmap: the admin triggers it, the member re-verifies, access is
restored — without deleting the seat or its history. Until it ships, the working path is
deactivate → re-invite. If recovery matters for your rollout, tell us:
[javi@valyd.id](mailto:javi@valyd.id).

## Notes for integrators

- Organizations do not change the login/verification API surface. Your app still uses the same OAuth
  `client_id` / `client_secret` for Login with Valyd and the same App API key for the Verification
  APIs — an organization governs **who owns the app**, **who may log into it**, and gives you the
  **Members API** for workforce onboarding.
- For a **private** org app, a user who is not an assigned member is refused at the OAuth authorize
  step. Public apps behave exactly as before.
