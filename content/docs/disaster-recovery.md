# Disaster recovery

Valyd's continuity and recovery posture — backups, recovery objectives, failover, and restore
testing. Valyd's continuity and recovery details are shared with enterprise customers on
request — contact your Valyd account team for backup, RTO/RPO, and DR-plan specifics. What *is*
documented publicly lives on adjacent pages and is cross-linked below; this page asserts no
recovery guarantee that is not already stated elsewhere.

## Backups

| Question | Answer |
| --- | --- |
| Backup cadence & method | Available on request — contact your Valyd account team |
| Backup retention & location | Available on request — contact your Valyd account team |
| Backup encryption | Available on request — contact your Valyd account team |

Where the underlying data is processed and stored is documented on
[Data residency](/docs/data-residency), and how long each class of data is kept is documented on
[Data retention](/docs/data-retention).

## Recovery objectives

| Question | Answer |
| --- | --- |
| RPO (Recovery Point Objective) | Available on enterprise plans — contact your Valyd account team |
| RTO (Recovery Time Objective) | Available on enterprise plans — contact your Valyd account team |

[Operations & SLA](/docs/operations-sla) summarizes the documented degraded-mode / failover
behavior; this page is the fuller home for backup, RTO/RPO, and DR-plan questions.

## Failover & redundancy

| Question | Answer |
| --- | --- |
| Multi-region / multi-AZ | Available on request — contact your Valyd account team |
| Failover trigger | Available on request — contact your Valyd account team |

Note the observable degraded-dependency behavior that *is* documented: when an upstream
dependency is unreachable, Valyd surfaces a machine-readable error to retry against rather than
failing silently — see
[Operations & SLA — degraded-dependency behavior](/docs/operations-sla#degraded-dependency-behavior).

## Restore testing & DR plan

| Question | Answer |
| --- | --- |
| Restore testing | Available on request — contact your Valyd account team |
| DR plan document | A DR-plan summary is available under NDA — contact your Valyd account team or **security@valyd.id** |

## See also

- [Operations & SLA](/docs/operations-sla) — uptime, status, incident comms, degraded-mode signals
- [Data residency](/docs/data-residency) — where data is processed and stored
- [Data retention](/docs/data-retention) — what is kept and for how long
- [Trust Center](/docs/security-trust)
