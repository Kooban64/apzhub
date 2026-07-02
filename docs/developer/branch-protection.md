# Branch protection (documentation)

Configure on the GitHub repository when remote is connected:

## Required status checks

- CI (`quality` job): lint, typecheck, format, test, build

## Rules

- Require pull request before merge to `main`
- Require status checks to pass
- Require branches to be up to date

SPR-001 scaffolds `.github/workflows/ci.yml`; apply branch rules in GitHub Settings → Branches.
