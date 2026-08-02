# Test Suite Events — APZQEP-140-A

Published via existing Event Platform only.

| Event type                    | When                  |
| ----------------------------- | --------------------- |
| `qep.suite.created`           | Suite created         |
| `qep.suite.updated`           | Metadata updated      |
| `qep.suite.published`         | Published             |
| `qep.suite.archived`          | Archived              |
| `qep.suite.versioned`         | Version bumped        |
| `qep.suite.deleted`           | Logical delete        |
| `qep.suite.restored`          | Restored from archive |
| `qep.suite.retired`           | Retired               |
| `qep.suite.lifecycle_changed` | Other transitions     |

Modules do not notify or search directly — processors consume these events.
