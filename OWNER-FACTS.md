# OWNER-FACTS — enterprise questionnaire (internal, not published)

**This file lives at the repo root so it never becomes a site page.** It is the owner's to-do list
of enterprise/security facts that the public pages currently state as honest "available on request /
under NDA" wording. When you confirm a value, **replace the wording on the named public page** with
the real fact — do not just tick the box here.

**Rules that already hold on the live site:** no `[owner: confirm]` text is public (a CI gate,
`check-public-placeholders`, fails the build if any reappears). Contacts in use: **support@valyd.id**
(operations/billing/data) and **security@valyd.id** (security/compliance/disclosure).

**Already answered from repo facts (no owner action):**
- Support channel = `support@valyd.id` — on `operations-sla.md` / `support-escalation.md`.
- Per-key scoping = all-or-nothing (an App API key is a full-authority credential) — on `api-key-lifecycle.md`.

Each row: **Fact needed · Public page · Why an enterprise buyer needs it · Current safe public wording.**

---

## 1. Compliance

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| SOC 2 status, type, report date, how to request the report | security-trust | Vendor-risk review gate | "Report and current status available under NDA — contact security@valyd.id" |
| ISO 27001 certification status + certificate scope (if any) | security-trust | ISMS assurance | "Current certification status available under NDA — contact security@valyd.id" |
| GDPR posture; lawful basis; processor vs controller | security-trust | Determines the customer's own GDPR duties | "Posture and controller/processor terms available under NDA" |
| Signable DPA exists + how to execute it | security-trust | Legally required to process EU data | "Available on request — contact your account team / security@valyd.id" |

## 2. Security

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Pen-test cadence, latest date, shareable summary letter | security-trust | Third-party assurance | "Summary results available under NDA — contact security@valyd.id" |
| PGP key / secure intake for sensitive reports | security-disclosure | Safe vuln reporting | "Not currently offered — email security@valyd.id and we'll arrange a secure channel" |
| Report acknowledgement time | security-disclosure | Researcher expectations | "We acknowledge valid reports and follow up (no fixed public SLA)" |
| Coordinated-disclosure timeline + safe-harbor language | security-disclosure | Legal safe harbor for researchers | "Coordinated disclosure — reasonable time to remediate before public disclosure" |
| Bug-bounty / reward program (exists? where) | security-disclosure | Researcher incentive | "No public program at this time — report to security@valyd.id" |
| `security.txt` `Expires:` date + `Policy:` URL + hosting domains | security-disclosure | RFC 9116 discoverability | Sample uses `<…>` template placeholders; set real values when publishing the file |
| API-key rotation overlap window (both keys valid?) + length | api-key-lifecycle | Zero-downtime key rotation | "Not documented here; for a coordinated cutover, contact support@valyd.id" |
| Explicit revoke without minting a replacement? | api-key-lifecycle | Incident response (kill a leaked key) | "Not documented — contact support@valyd.id" |
| Per-key last-used time / usage in Console? | api-key-lifecycle | Detect stale/compromised keys | "Not documented — contact support@valyd.id" |
| Max simultaneously active API keys per app | api-key-lifecycle | Rotation planning | "Not documented — contact support@valyd.id" |

## 3. Infrastructure / residency

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Region(s) where account + verification data is processed/stored | data-residency | Data-sovereignty rules | "Available on request — current data-residency options" |
| EU (or other) residency option + how to select it | data-residency | EU customers' localization needs | "Available on request — discuss regional options" |
| Cross-border transfer mechanism (SCCs) + safeguards | data-residency | Lawful international transfer | "Available on request — contact support@valyd.id" |
| Hosting/cloud provider(s) + their regions | data-residency | Concentration-risk assessment | "Available on request — contact support@valyd.id" |
| Where the verification / face-matching engine runs | data-residency | Biometric-data locality | "Available on request — contact support@valyd.id" |

## 4. Subprocessors

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Canonical subprocessor list URL/document | data-residency | Required in DPAs | "Available on request — current subprocessor list" |
| Vendors for document authenticity + OCR | data-residency | Fourth-party risk | "Available on request — contact support@valyd.id" |
| Registries/vendors for license/credential checks | data-residency | Data-flow mapping | "Available on request — contact support@valyd.id" |
| Advance notice before a subprocessor is added/changed | data-residency | DPA objection rights | "Available on request — contact support@valyd.id" |

## 5. Availability / SLA

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Committed uptime target + which tiers | operations-sla | Reliability guarantee | "Committed availability is part of the enterprise SLA — contact your account team" |
| Contractual SLA with service credits + where published | operations-sla | Financial remedy for downtime | "Available on enterprise plans — contact your account team" |
| Public status page URL | operations-sla / support-escalation | Live incident visibility | "Available on request — contact support@valyd.id" |
| Incident-update channel (status page/email) | operations-sla | Ops awareness | "Available on request — contact support@valyd.id" |
| Maintenance-window policy + advance-notice period | operations-sla | Change-management planning | "Available on request — contact support@valyd.id" |

## 6. Disaster recovery

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Backup cadence + method (PITR vs snapshots) | disaster-recovery | BC/DR due diligence | "Available on request — contact your account team" |
| Backup retention + region(s) | disaster-recovery | Recovery-scope assessment | "Available on request — contact your account team" |
| Backups encrypted at rest + key management | disaster-recovery | Data-protection control | "Available on request — contact your account team" |
| RPO (max data-loss window) | disaster-recovery / operations-sla | Recovery planning | "Available on enterprise plans — contact your account team" |
| RTO (target time to restore) | disaster-recovery / operations-sla | Recovery planning | "Available on enterprise plans — contact your account team" |
| Multi-region / multi-AZ redundancy | disaster-recovery | Resilience assessment | "Available on request — contact your account team" |
| Failover automatic vs manual + who initiates | disaster-recovery | Outage expectations | "Available on request — contact your account team" |
| Restore-test cadence + last successful test date | disaster-recovery | Proof DR actually works | "Available on request — contact your account team" |
| BC/DR plan document + NDA-shareable summary | disaster-recovery | Formal DR evidence | "DR-plan summary available under NDA — account team / security@valyd.id" |

## 7. Auditability

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Recent-webhook-deliveries lookback + are older deliveries queryable | audit-logging | Reconciliation / dispute evidence | "Not documented — contact support@valyd.id" |
| Export (CSV/API) or SIEM streaming of events/deliveries | audit-logging | SOC/SIEM integration | "Not documented — contact support@valyd.id" |
| Append-only / tamper-evident activity records + attestable? | audit-logging | Non-repudiation | "Not documented — contact support@valyd.id" |
| Account-level audit trail of config changes (key rotation, member add/remove, app settings, manual overrides) + where an admin reads it | audit-logging | Change accountability | "Not documented — contact support@valyd.id" |
| Which roles can view the delivery log / event history (member-role excluded?) | audit-logging | Least-privilege review | "Not documented — contact support@valyd.id" |

## 8. Incident response

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Incident-response + breach-notification process + notification SLA | security-trust | Regulatory breach-notice duties | "Incident-response details available under NDA — contact security@valyd.id" |
| Post-incident / RCA reports shared? how to request | operations-sla | Post-mortem accountability | "Available to enterprise customers on request — contact your account team" |
| Escalation path for production-impacting incidents (incl. out-of-hours) | operations-sla / support-escalation | Fast outage resolution | "Contact your Valyd account team" |

## 9. Support

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Support hours + time-zone coverage | support-escalation | Coverage vs the customer's ops | "Available on request — contact support@valyd.id" |
| Support tiers/plans + what each includes | support-escalation | Procurement comparison | "Available on enterprise plans — contact your account team" |
| First-response + resolution targets by severity | support-escalation | Operational SLAs | "Committed targets are part of enterprise plans — contact your account team" |
| Non-technical contact (invoices, seats, plan changes) | support-escalation | Account admin | "support@valyd.id" |

## 10. Data lifecycle

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Retention of verification decisions + account proofs | data-retention | Data-minimization / audits | "Available on request — current retention schedule" |
| Webhook delivery-log retention window | data-retention | Reconciliation windows | "Available on request — current retention schedule" |
| Application/request log retention | data-retention | Forensics vs minimization | "Available on request — current retention schedule" |
| Audit + billing record retention (legal/tax minimums) | data-retention | Statutory retention | "Retained per applicable legal/tax/accounting requirements" |
| Deletion request path + completion SLA | data-retention | GDPR/CCPA erasure rights | Documented delete/unlink mechanism (`user_deleted` 410) + "for a formal erasure request or timeline, contact support@valyd.id" |

## 11. API rate limits (operational, not enterprise-security but still open)

| Fact needed | Page | Why needed | Current public wording |
|---|---|---|---|
| Concurrent-request cap on `/api/v2` (or "none") | rate-limits | Client concurrency planning | "Not published — contact support@valyd.id" |
| Burst allowance above steady rate on `/api/v2` (or "none") | rate-limits | Burst-traffic handling | "Not published — contact support@valyd.id" |
| Per-endpoint RPM for OIDC token endpoints | rate-limits | Login-throughput planning | "Not published — contact support@valyd.id" |
| Per-endpoint RPM for Account API reads | rate-limits | Read-throughput planning | "Not published — contact support@valyd.id" |
| Burst + concurrency caps for `/api/auth` | rate-limits | Auth-traffic planning | "Not published — contact support@valyd.id" |
