> Source: https://docs.valyd.work/docs/organizations
> Part of: Valyd Developer documentation — static copy generated for AI agents
> Generated from repo component: OrganizationsSection.tsx

# Organizations & teams

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/organizations
- Credentials / env vars needed: none to read; to act you sign in to the developer portal (https://dev.valyd.work)
- Files an integrator edits: none — this is a portal/account concept, not an API you call
- Can complete without human input: NO — creating an organization, inviting teammates, and adding members are human web steps in the portal
- Prerequisites: a Valyd account able to sign in to the developer portal

A Valyd account is one of two types:

- **Individual** — a solo developer. Their apps are always **public**.
- **Organization** — a company with a team, roles, members, and public *or* private apps.

You sign in as a person first, then create an organization and become its **owner**. The
organization is a **tenant**, not a login.

## Roles

There are three roles in an organization:

- **Owner / Admin** — sees and manages everything: the organization, its team, members, apps and
  billing. Can assign roles and add people (admin, developer, or member).
- **Developer** — signs in, sees the organizations they belong to, and creates & manages apps. No
  member or billing administration.
- **Member** — the workforce. Does **not** see the organization at all. A member exists only to log
  into the apps assigned to them, by face.

## What an organization gives you

- **Teams & roles** — invite teammates and give each a role; clear separation between who builds and
  who administers.
- **Shared apps** — apps belong to the organization, not one person. Any developer on the team can
  manage them; ownership does not leave when a person does.
- **Workforce by face** — add members by CSV (first name, last name, email) or one at a time. Each
  gets a link and joins by scanning their face — no passwords. Only **active** (face-activated)
  members are billable; invited-but-not-activated and deactivated members are free.
- **Public & private apps** — a **public** app lets anyone log in (the default). A **private** app is
  scoped to specific members: only assigned members can sign in, enforced at the login gate. Admins
  add and remove members from a private app.
- **One billing account** — pay-as-you-go verification usage and per-seat subscriptions post to a
  single wallet and ledger. Multiple products, billed from one place.

## How to start

1. Sign in to the developer portal (https://dev.valyd.work) and open the Organization tab.
2. Create an organization — you become its owner.
3. Invite teammates (developer or admin) and create apps under the organization.
4. Add members (your workforce) by CSV or singly; they join by scanning their face.
5. Mark apps public or private, and assign members to the private ones.

## Notes for integrators

- Organizations do not change the API surface. Your app still uses the same OAuth `client_id` /
  `client_secret` for Login with Valyd and the same App API key for the Verification APIs — an
  organization just governs **who owns the app** and **who may log into it**.
- For a **private** org app, a user who is not an assigned member is refused at the OAuth authorize
  step. Public apps behave exactly as before.
