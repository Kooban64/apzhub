# Compatibility Verification

| Check                                      | Result                      |
| ------------------------------------------ | --------------------------- |
| Existing notification metadata APIs        | PASS (inbox under `/inbox`) |
| Event Bus consumers                        | PASS (additive subscribe)   |
| Observe/Support integrations               | PASS (hook optional)        |
| SSE connections default support topic      | PASS                        |
| Migrations additive 0065                   | PASS                        |
| Config deny-by-default                     | PASS                        |
| Disabled delivery = Platform 1.2 behaviour | PASS                        |
| Integration SDK                            | PASS unchanged              |
