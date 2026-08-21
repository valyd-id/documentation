# Disaster recovery

Valyd's continuity and recovery posture — backups, recovery objectives, failover, and restore
testing. Valyd's public documentation does not yet state any of these, so nearly every row on
this page is a placeholder for the owner to supply, framed as a specific question. What *is*
documented lives on adjacent pages and is cross-linked below; this page asserts no recovery
guarantee that is not already stated elsewhere.

## Backups

| Question | Answer |
| --- | --- |
| Backup cadence & method | [owner: confirm — backup cadence and method for account, verification, and billing data (e.g. continuous/PITR vs periodic snapshots)] |
| Backup retention & location | [owner: confirm — how long backups are retained and in which region(s) they are stored] |
| Backup encryption | [owner: confirm — whether backups are encrypted at rest and with what key management] |

Where the underlying data is processed and stored is documented on
[Data residency](/docs/data-residency), and how long each class of data is kept is documented on
[Data retention](/docs/data-retention).

## Recovery objectives

| Question | Answer |
| --- | --- |
| RPO (Recovery Point Objective) | [owner: confirm — the maximum data-loss window a restore can incur (RPO)] |
| RTO (Recovery Time Objective) | [owner: confirm — the target time to restore service after a major outage (RTO)] |

[Operations & SLA](/docs/operations-sla) already carries an owner placeholder for documented
degraded-mode / failover behavior and any RTO/RPO targets — this page is the fuller home for
those answers.

## Failover & redundancy

| Question | Answer |
| --- | --- |
| Multi-region / multi-AZ | [owner: confirm — whether Valyd runs multi-region or multi-AZ redundancy for its data and verification engine] |
| Failover trigger | [owner: confirm — whether failover to a standby is automatic or manual, and who initiates it] |

Note the observable degraded-dependency behavior that *is* documented: when an upstream
dependency is unreachable, Valyd surfaces a machine-readable error to retry against rather than
failing silently — see
[Operations & SLA — degraded-dependency behavior](/docs/operations-sla#degraded-dependency-behavior).

## Restore testing & DR plan

| Question | Answer |
| --- | --- |
| Restore testing | [owner: confirm — whether backup restores are tested on a schedule, the cadence, and the date of the last successful restore test] |
| DR plan document | [owner: confirm — whether a business-continuity / DR plan document exists and whether a summary is shareable with customers under NDA] |

## See also

- [Operations & SLA](/docs/operations-sla) — uptime, status, incident comms, degraded-mode signals
- [Data residency](/docs/data-residency) — where data is processed and stored
- [Data retention](/docs/data-retention) — what is kept and for how long
- [Trust Center](/docs/security-trust)
