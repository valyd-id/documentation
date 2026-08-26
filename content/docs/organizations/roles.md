# Roles & access

An organization has exactly four roles. **Owner** and **admin** run the organization; a
**developer** builds apps; a **member** is the workforce — read-only in the portal (they see the
organization and its members list, but not projects) and signs into your apps by face.

| Role | Developer Portal | Face required | What they can do |
| --- | --- | --- | --- |
| `owner` | Yes | No | Everything — the organization, its team, members, apps and billing. Assigns roles, adds and removes people, and mutates anything. The person who created the organization. |
| `admin` | Yes | No | The same management powers as the owner: manage the organization, team, members, apps and billing, assign roles, and add people. |
| `developer` | Yes | No | Signs into the Developer Portal, sees the organizations they belong to, and creates & manages apps. **No member or billing administration.** No face activation — a developer is console staff, not workforce. |
| `member` | Read-only | Yes | The **workforce**. Read-only in the portal — a member can see the organization and its members list, but **not** its projects, keys or settings; they exist to sign into the apps assigned to them, **by face**. Face-keyed: the membership binds to a real Valyd identity when they scan their face, and that identity is how they log in. |

**Owner and admin manage and mutate.** Only they can add people, assign or change roles,
deactivate/reactivate members, and touch billing. Developers and members cannot change anyone's
role.

**Developers get console access, no face.** A developer signs into the portal to build and manage
apps. They are not part of the face-login workforce and never need to activate a face.

**Members are the face-keyed workforce.** Every active member is a real, face-activated Valyd
identity. When a member signs into one of your apps, the `valyd_org_member_id` claim (their
`vmem_…` id) comes back so you always know which of your people logged in.

## Assigning & changing roles

An owner or admin does it in the Developer Portal:

- **Organization → Team** — for staff roles (`admin`, `developer`).
- **Organization → Members** — for the workforce (`member`).

Every mutation is admin-gated; developers and members can't change anyone's role. Over the API,
the role is set when you [add a member](/docs/organizations/api#add-members) (`role` defaults to
`member`).
