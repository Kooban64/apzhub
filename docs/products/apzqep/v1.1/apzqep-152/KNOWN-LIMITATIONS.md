# Known Limitations — APZQEP-152

Product Board classifications (20260803T064700Z). None reopen RB-002.

| #   | Limitation                                                 | Classification               | Notes                                                  |
| --- | ---------------------------------------------------------- | ---------------------------- | ------------------------------------------------------ |
| 1   | Shell Cap nav may show Cap routes while API returns 403    | **Future UX improvement**    | API is authoritative; not a security failure           |
| 2   | `projectId` is attribute filter; no project membership ACL | **Architectural refinement** | Tenant isolation + Cap permissions sufficient for V1.0 |
| 3   | `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` opt-in                   | **Accepted**                 | Explicit, configurable, documented                     |
| 4   | Packages remain 0.1.0                                      | **Correct**                  | Promotion after production certification               |
| 5   | Production GO not declared                                 | **By design**                | Requires APZQEP-150R + Board Go/No-Go                  |
