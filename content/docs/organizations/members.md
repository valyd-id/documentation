# Members & onboarding

A **member** is one person on your workforce roster. You add members three ways — one at a time in
the portal, by CSV upload, or over the [Organization API](/docs/organizations/api#add-members)
(`addMembers()`). Each member you add gets a stable **member id `vmem_…`** — store it against your
own employee/user record; it's your correlation key between your roster and Valyd.

## How a member is invited

When you add someone, Valyd issues an invite. The **method** depends on the role, and you can force
it with the `invite` option on [add member(s)](/docs/organizations/api#add-members):

| `invite` | What happens |
| --- | --- |
| `auto` *(default)* | Valyd picks the right link for the role. A **workforce member** (`role: member`) gets a **face-activation link** — they scan their face once to bind the membership to a real Valyd identity. An **admin or developer** gets an **email claim link** to join the console. |
| `email` | Force the **email** path — an email claim/activation link is sent. |
| `face` | Force the **face-activation** path — a face link is issued for the person to scan. |

By default (`notify: true`) Valyd emails the link for you. Pass **`notify: false`** and each created
member comes back with its own `activation_link` in the API response so you can deliver it yourself
(your own email / SMS / in-app message). Note: `activation_link` is returned **only for face
invites** — email/claim links are emailed, never handed back.

## How a new member is notified

Adding a member (portal, CSV, or `addMembers()`) emails them their invite link — for the workforce,
a **face-activation link**. They tap it, scan their face once, and their membership is bound to a
real Valyd identity. Prefer to deliver it yourself? Pass `notify: false` and read each created
member's `activation_link`. Re-send anytime with
[`resendMemberInvite(memberId)`](/docs/organizations/api#re-send-invite). To know when someone
finished, **poll** [`getMembers()`](/docs/organizations/api#list-members) and watch for
`status: "active"`.

## Member lifecycle (status)

A membership moves through exactly four states:

| `status` | Meaning | Billable? |
| --- | --- | --- |
| `invited` | Created, no email sent yet (the `notify: false` path). | No |
| `link_sent` | Activation email sent, awaiting the person. | No |
| `active` | Face-activated and bound to a Valyd identity. | **Yes** — the only billable state |
| `deactivated` | Removed from the workforce; app logins revoked, row kept. | No |

Only the `active` state is billable — a seat turns on the moment the member **scans their face**.
See [Pricing & billing](/docs/organizations/billing).

## Deactivate, remove, reactivate

- **Deactivate** — [`deactivateMember(memberId)`](/docs/organizations/api#deactivate) stops billing
  and revokes the member's app logins, but keeps the row. Their Valyd identity is **not** deleted.
- **Remove** — [`removeMember(memberId)`](/docs/organizations/api#remove) is the same deactivation by
  default; pass `{ permanent: true }` to delete the membership row outright, so the email can be
  re-invited cleanly. The person's Valyd account is never deleted.
- **Reactivate** — [`reactivateMember(memberId)`](/docs/organizations/api#reactivate) restores a
  deactivated member to `active` if their Valyd identity still exists, or back to `invited` (they
  must re-activate by face) if it doesn't.
- **Re-send an invite** — if a member's invite expired before they connected their Valyd ID,
  [`resendMemberInvite(memberId)`](/docs/organizations/api#re-send-invite) issues and emails a fresh
  face-activation link (and returns it), superseding the old one. It refuses for already-active or
  deactivated members.

None of these ever touch the person's Valyd identity or their membership in any other organization.
Only `member`-role people appear on the roster — use
[`resolveMember({ valydId })`](/docs/organizations/api#resolve-one-person) to check whether someone
is a workforce member vs a developer/admin, or not in your org at all.

In the Developer Portal, the org owner/admin sees the full roster with each member's status on the
**Organization → Members** tab, and can re-send invites, deactivate/reactivate, or **Remove** a
member outright (permanent, same as the API's `permanent: true`).

## Account recovery — coming soon

If a member loses access to their Valyd identity (new phone, device lost), an org-assisted
**recovery** flow is on the roadmap: the admin triggers it, the member re-verifies, access is
restored — without deleting the seat or its history. Until it ships, the working path is
deactivate → re-invite. If recovery matters for your rollout, tell us:
[javi@valyd.id](mailto:javi@valyd.id).
