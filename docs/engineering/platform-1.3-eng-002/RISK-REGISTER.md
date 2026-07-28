# Risk Register — ENG-002

| ID           | Risk                             | Mitigation                          |
| ------------ | -------------------------------- | ----------------------------------- |
| ENG002-RK-01 | Ops enable without rules → noise | Deny-by-default + diagnostics       |
| ENG002-RK-02 | Event bus failure                | Fail-soft publish; state preserved  |
| ENG002-RK-03 | Marketing overclaim on paging    | Honesty banners + KL classification |
