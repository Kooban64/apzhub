# APZHUB Product Lifecycle

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZHUB-ENG-003   |
| Timestamp | 20260803T075550Z |

## Product states

| State                | Meaning                                   |
| -------------------- | ----------------------------------------- |
| Planning             | Roadmap / architecture authorised         |
| Engineering          | Owner-authorised delivery programmes      |
| Engineering Complete | Delivery done; release not yet decided    |
| Readiness Audit      | Independent verification                  |
| Remediation          | Clearing release blockers                 |
| Re-certification     | Fresh audit after remediation             |
| Board Decision       | GO / NO-GO pending or in progress         |
| General Availability | Board-authorised production release       |
| Operations-led       | Standing ops cycle; eng closed by default |
| Version N+1 Planning | Board-authorised planning only            |
| Superseded / EOL     | Per Board                                 |

## Version discipline

1. Version N engineering lifecycle closes at GA + ops establishment.
2. Version N+1 does **not** auto-open at GA.
3. Version N+1 planning requires operational evidence + Board / Owner Auth.
4. Historical version audits remain immutable.

## Authoritative status document

Every product SHALL maintain a `PRODUCT-STATUS.md` (or portfolio-equivalent) that wins over conversation memory.
