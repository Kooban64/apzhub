# Remote Synchronisation Report — APZQEP-RELEASE-003

| Field     | Value                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Remote    | `origin` → `git@github.com:kooban-apzor/apz-portal.git` (SSH after push attempt; HTTPS also failed earlier) |
| Attempted | `git push -u origin HEAD`                                                                                   |
| Result    | **FAIL**                                                                                                    |
| Blocker   | **B-01**                                                                                                    |

## Attempts

| Method                                             | Outcome                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| HTTPS push                                         | `could not read Username for 'https://github.com'`                        |
| SSH (`git@github.com:kooban-apzor/apz-portal.git`) | Authenticated as GitHub user without repo access → `Repository not found` |
| `gh` CLI                                           | Not logged in to GitHub hosts                                             |

## Required Owner intervention

1. Authenticate an identity with **push** rights to `kooban-apzor/apz-portal`.
2. Push local `main` including candidate `ce220a5d` (and any subsequent authorised release commit).
3. Verify:

```text
local frozen/release commit
=
remote release commit
=
release tag target
=
released package source
```

No force-push. No history rewrite.
