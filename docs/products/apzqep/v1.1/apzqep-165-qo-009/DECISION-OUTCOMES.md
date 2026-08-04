# Decision Outcomes

| Outcome        | Meaning                                            |
| -------------- | -------------------------------------------------- |
| GO             | Profile thresholds satisfied                       |
| CONDITIONAL_GO | Soft failures / conditions; profile allows         |
| NO_GO          | Hard failure against profile thresholds            |
| DEFERRED       | Waiting (e.g. outstanding approvals) or flow defer |
| SUPERSEDED     | Quality Flow lifecycle hint superseded             |
| CANCELLED      | Flow/approval cancelled                            |

All outcomes are **advisory**. They are not release approvals and do not deploy software.
