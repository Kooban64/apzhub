# Source Change Model

| Owns                                                   | Does not own                         |
| ------------------------------------------------------ | ------------------------------------ |
| Normalize inbound source identities                    | Inspect repositories                 |
| Associate changes with Quality Flow / Decision Package | Compare commits                      |
| Produce Source Change Package                          | Call GitHub/GitLab/Azure DevOps/etc. |
| Publish past-tense events via Event Backbone           | Policy / governance / decisions      |

Providers publish normalized source changes independently. APZQEP-162 remains the SCM platform; QO-012 only coordinates identity.
