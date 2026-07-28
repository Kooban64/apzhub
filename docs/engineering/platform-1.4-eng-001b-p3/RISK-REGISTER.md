# Risk Register — Platform-1.4-ENG-001B-P3

| ID      | Risk                             | Mitigation                                  | Residual                                             |
| ------- | -------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| R-P3-01 | Stale worker overwrite           | Lease fencing on all completions            | Low                                                  |
| R-P3-02 | Dual runtime double-dispatch     | Flag ON disables process-local queue/worker | Low–Med (ops must not mix intake stores incorrectly) |
| R-P3-03 | Uncertain timeout duplicates     | Honest classification + retry; documented   | Med                                                  |
| R-P3-04 | Postgres fencing unverified live | Mocked SQL + in-memory fencing tests; KL    | Med until live CI                                    |
| R-P3-05 | Event bus outage                 | Fail-soft after commit                      | Low                                                  |
