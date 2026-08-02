# APZQEP Operational Runbook

## Health incident

1. `curl -fsS $BASE_URL/api/health`
2. Check compose/Caddy/`ENVIRONMENT.md` ports
3. Inspect web logs
4. If recent deploy — Rollback Guide

## Cap data “missing”

Expected after restart under LIMITED_AVAILABILITY (IN-MEMORY). Not a restore failure.

## Dual surfaces

Operators must use Core QE paths (`enterprise-requirements`, `enterprise-reporting`, `execution-workspace`) vs legacy ENG paths — see Document Map.
