# OWNER-FACTS — enterprise facts to confirm

**Internal — not published.** This file lives at the repo root on purpose so it never becomes
a site page. It preserves the owner's original `[owner: confirm — …]` questions that were
removed from the 10 public enterprise pages. Each question was replaced on the live page with
an honest "available on request / contact us" statement (noted below).

When you have a real answer, **replace the honest-placeholder text on the named page** with the
confirmed fact (a real number, date, region, SLA, URL, etc.) — do not just delete this list.

Contacts already used on the pages: **support@valyd.id** (documented in the repo) and
**security@valyd.id** (security/compliance intake).

Two questions were already answerable from existing repo facts and are marked **[ANSWERED ON
PAGE]** — no owner action needed:
- `operations-sla.md` → Support channel/address = `support@valyd.id` (documented repo-wide).
- `api-key-lifecycle.md` → Per-key scopes = all-or-nothing (the page's own "Access model"
  section already states an App API key is a full-authority credential with no reviewer role).

---

## security-trust.md

Honest text used: compliance rows now say "available under NDA — contact **security@valyd.id**".

- [ ] SOC 2 status, type, report date, and how prospects request the report
      → replaced with "Report and current status available under NDA — contact security@valyd.id"
- [ ] ISO 27001 certification status and certificate scope, if any
      → replaced with "Current certification status available under NDA — contact security@valyd.id"
- [ ] GDPR posture, lawful basis, and whether Valyd acts as processor or controller
      → replaced with "Posture and controller/processor terms available under NDA — contact security@valyd.id"
- [ ] Whether a signable DPA exists and how customers execute it
      → replaced with "Available on request — contact your Valyd account team or security@valyd.id to execute a DPA"
- [ ] Pen-test cadence, most recent test date, and whether a summary letter is shareable
      → replaced with "Summary results available under NDA — contact security@valyd.id"
- [ ] Incident-response and breach-notification process and notification SLA
      → replaced with "Handled through Security disclosure; incident-response details available under NDA — contact security@valyd.id"

## data-retention.md

Honest text used: retention rows now say "Available on request — contact **support@valyd.id**".

- [ ] How long verification decisions and account proofs are retained
      → replaced with "Available on request — contact support@valyd.id for the current retention schedule"
- [ ] Webhook delivery-log retention window
      → replaced with "Available on request — contact support@valyd.id for the current retention schedule"
- [ ] Application/request log retention period
      → replaced with "Available on request — contact support@valyd.id for the current retention schedule"
- [ ] Audit and billing record retention period, incl. any legal/tax minimums
      → replaced with "Retained per applicable legal, tax, and accounting requirements — contact support@valyd.id for the current schedule"
- [ ] How a customer or end-user requests deletion and the completion SLA
      → replaced with documented deletion mechanism (account delete/unlink clears the biometric vector, `user_deleted` 410) + "For a formal erasure request or the completion timeline, contact support@valyd.id"

## data-residency.md

Honest text used: all rows now say "Available on request — contact **support@valyd.id**".

- [ ] Region(s) where Valyd processes and stores account and verification data (e.g. US-only)
      → replaced with "Available on request — contact support@valyd.id for current data-residency options"
- [ ] Whether an EU (or other region) data-residency option is offered, and how a customer selects it
      → replaced with "Available on request — contact support@valyd.id to discuss regional data-residency options"
- [ ] Transfer mechanism for data leaving its region (e.g. SCCs) and applicable safeguards
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Hosting/cloud provider(s) and their regions
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Where the verification and face-matching engine runs
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Canonical subprocessor list URL or document
      → replaced with "Available on request — contact support@valyd.id for the current subprocessor list"
- [ ] Vendors used for document authenticity and OCR
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Registries and vendors used for license/credential checks
      → replaced with "Available on request — contact support@valyd.id"
- [ ] How customers are notified before a subprocessor is added or changed
      → replaced with "Available on request — contact support@valyd.id"

## operations-sla.md

Honest text used: SLA/uptime rows point to the enterprise SLA / account team; support address is a real fact.

- [ ] Committed uptime target (e.g. 99.9%) and the SLA tier(s) it applies to
      → replaced with "Committed availability targets are part of the enterprise SLA — contact your Valyd account team"
- [ ] Whether a contractual SLA with service credits exists, and where it is published
      → replaced with "A contractual SLA with service credits is available on enterprise plans — contact your Valyd account team"
- [ ] Public status page URL
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Channel used for incident updates (status page, email, etc.)
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Whether post-incident / RCA reports are shared and how to request them
      → replaced with "Post-incident reviews are available to enterprise customers on request — contact your Valyd account team"
- [ ] Maintenance window policy and advance-notice period
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Documented degraded-mode / failover behavior and any RTO/RPO targets
      → replaced with pointer to Disaster recovery + enterprise SLA (contact your Valyd account team)
- [ ] Support hours and first-response targets by severity
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Escalation path for production-impacting incidents
      → replaced with pointer to Support & escalation + "contact your Valyd account team"
- [x] Support contact address or portal — **[ANSWERED ON PAGE]** = `support@valyd.id` (documented repo-wide)

## rate-limits.md

Honest text used: unpublished limits now say "Not published — contact **support@valyd.id**".

- [ ] Any concurrent-request cap on `/api/v2`, or state "none"
      → replaced with "Not published — contact support@valyd.id"
- [ ] Burst/leaky-bucket allowance above the steady rate on `/api/v2`, or state "none"
      → replaced with "Not published — contact support@valyd.id"
- [ ] Per-endpoint RPM for the OIDC token endpoints (authorize/token/refresh), or "none published"
      → replaced with "Not published — contact support@valyd.id"
- [ ] Per-endpoint RPM for Account API reads (`userinfo` / Account API)
      → replaced with "Not published — contact support@valyd.id"
- [ ] Burst and concurrency caps for the auth APIs (`/api/auth`)
      → replaced with "Not published — contact support@valyd.id"

## api-key-lifecycle.md

Honest text used: undocumented items now say "Not documented — contact **support@valyd.id**".

- [ ] Whether rotation supports an overlap window where the old and new key are both valid, and its length
      → replaced with "not documented here; for a coordinated cutover, contact support@valyd.id"
- [ ] Whether a key can be revoked without minting a replacement (explicit revoke)
      → replaced with "Not documented — contact support@valyd.id"
- [ ] Whether the Console shows a per-key last-used time or usage
      → replaced with "Not documented — contact support@valyd.id"
- [x] Whether an App API key can be scoped to a subset of Verify capabilities, or is all-or-nothing
      → **[ANSWERED ON PAGE]** = All-or-nothing (full-authority credential; no per-key scoping — per the page's Access model section)
- [ ] Max simultaneously active API keys per app
      → replaced with "Not documented — contact support@valyd.id"

## security-disclosure.md

Honest text used: security contact = **security@valyd.id**; disclosure language kept honest (no invented timeline/bounty).

- [ ] Security contact email or intake form
      → replaced with "security@valyd.id" (and used in the `security.txt` sample `Contact:` line)
- [ ] PGP key or secure-intake option for sensitive reports, if offered
      → replaced with "Not currently offered — email security@valyd.id and we will arrange a secure channel if needed"
- [ ] How quickly a report is acknowledged
      → replaced with "We acknowledge valid reports and follow up with the reporter (no fixed public SLA)"
- [ ] Coordinated-disclosure timeline and safe-harbor language
      → replaced with "Coordinated disclosure — we ask for reasonable time to remediate before public disclosure"
- [ ] Whether a bug-bounty or reward program exists and where it is hosted
      → replaced with "No public bug-bounty program at this time — report directly to security@valyd.id"
- [ ] `security.txt` `Expires:` value (ISO 8601 expiry date)
      → sample now shows a `<ISO 8601 expiry date>` template placeholder; set a real date when publishing the file
- [ ] `security.txt` `Policy:` URL of the full disclosure policy
      → sample now shows a `<URL of the published disclosure policy>` template placeholder
- [ ] On which domains the `security.txt` will be hosted
      → replaced with "Valyd serves it on its primary product domains; contact security@valyd.id if you cannot locate it"

## audit-logging.md

Honest text used: undocumented rows now say "Not documented — contact **support@valyd.id**".

- [ ] How far back the Recent webhook deliveries list shows in the Portal, and whether older deliveries are queryable
      → replaced with "Not documented — contact support@valyd.id"
- [ ] Whether verification-event and webhook-delivery activity can be exported (CSV/API) or streamed to a SIEM, and how
      → replaced with "Not documented — contact support@valyd.id"
- [ ] Whether Valyd's activity records are append-only / tamper-evident, and whether that property is attestable
      → replaced with "Not documented — contact support@valyd.id"
- [ ] Whether an account-level audit trail records config changes (API-key rotation, member add/remove, app settings, manual decision overrides) and where an org admin reads it
      → replaced with "Not documented — contact support@valyd.id"
- [ ] Which roles can view the delivery log and event history, and whether member-role users are excluded
      → replaced with "Not documented — contact support@valyd.id"

Note: the section heading "Not yet documented (owner to confirm)" was renamed to "Not yet published"
to remove the internal annotation from the public page.

## support-escalation.md

Honest text used: support channel/account-billing = **support@valyd.id**; tiers/targets point to enterprise plans.

- [ ] The support contact channel(s): email address, portal URL, or in-app, and where to reach each
      → replaced with "support@valyd.id"
- [ ] Support hours and time-zone coverage
      → replaced with "Available on request — contact support@valyd.id"
- [ ] Whether support tiers or plans exist and what each includes
      → replaced with "Available on enterprise plans — contact your Valyd account team"
- [ ] First-response and resolution-time targets by severity
      → replaced with "Committed response targets are part of enterprise plans — contact your Valyd account team"
- [ ] The escalation path for a production-impacting incident, and how to reach it out of hours
      → replaced with "For a production-impacting incident, contact your Valyd account team"
- [ ] The public status page URL for live incident and maintenance updates
      → replaced with "Available on request — contact support@valyd.id"
- [ ] The contact for non-technical questions (invoices, seats, plan changes)
      → replaced with "support@valyd.id"

Note: the section heading "Channels & response targets (owner to confirm)" was renamed to
"Channels & response targets" to remove the internal annotation from the public page.

## disaster-recovery.md

Honest text used: continuity rows point to the account team; DR-plan summary "under NDA".

- [ ] Backup cadence and method for account, verification, and billing data (continuous/PITR vs periodic snapshots)
      → replaced with "Available on request — contact your Valyd account team"
- [ ] How long backups are retained and in which region(s) they are stored
      → replaced with "Available on request — contact your Valyd account team"
- [ ] Whether backups are encrypted at rest and with what key management
      → replaced with "Available on request — contact your Valyd account team"
- [ ] The maximum data-loss window a restore can incur (RPO)
      → replaced with "Available on enterprise plans — contact your Valyd account team"
- [ ] The target time to restore service after a major outage (RTO)
      → replaced with "Available on enterprise plans — contact your Valyd account team"
- [ ] Whether Valyd runs multi-region or multi-AZ redundancy for its data and verification engine
      → replaced with "Available on request — contact your Valyd account team"
- [ ] Whether failover to a standby is automatic or manual, and who initiates it
      → replaced with "Available on request — contact your Valyd account team"
- [ ] Whether backup restores are tested on a schedule, the cadence, and the date of the last successful restore test
      → replaced with "Available on request — contact your Valyd account team"
- [ ] Whether a business-continuity / DR plan document exists and whether a summary is shareable under NDA
      → replaced with "A DR-plan summary is available under NDA — contact your Valyd account team or security@valyd.id"
