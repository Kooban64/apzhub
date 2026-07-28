#!/usr/bin/env bash
# APZHUB-OPS-002 A5 — Production infrastructure / capacity validation (read-only)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EVIDENCE_DIR="${ROOT}/docs/operations/evidence/capacity"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "${EVIDENCE_DIR}"
OUT="${EVIDENCE_DIR}/${STAMP}-APZHUB-OPS-002-CAPACITY-CHECK.json"

DISK_USE="$(df -P / | awk 'NR==2{gsub(/%/,"",$5); print $5}')"
DISK_AVAIL="$(df -h / | awk 'NR==2{print $4}')"
MEM_AVAIL="$(awk '/MemAvailable/{printf "%.0f", $2/1024/1024}' /proc/meminfo 2>/dev/null || echo 0)"

# Thresholds from HOST-COEXISTENCE / CAPACITY-PLANNING (warn 80 / critical 90)
DISK_STATUS="ok"
if [[ "${DISK_USE}" -ge 90 ]]; then DISK_STATUS="critical"
elif [[ "${DISK_USE}" -ge 80 ]]; then DISK_STATUS="warn"
fi

echo "[capacity] disk_use=${DISK_USE}% avail=${DISK_AVAIL} mem_avail_gb≈${MEM_AVAIL} status=${DISK_STATUS}"

# Host coexistence audit (non-fatal if tooling fails)
COEXIST_EXIT=0
if pnpm ops:host-coexistence-audit -- --live >/tmp/apzhub-coexist-live.log 2>&1; then
  COEXIST="PASS"
else
  COEXIST="FAIL_OR_WARN"
  COEXIST_EXIT=1
fi

# Reserved port listen check (informational)
PORTS="3300 54334 6380 3080 3443 6006"
PORT_REPORT=""
for p in ${PORTS}; do
  if ss -ltn "( sport = :${p} )" 2>/dev/null | grep -q ":${p}"; then
    PORT_REPORT="${PORT_REPORT}${p}=LISTEN;"
  else
    PORT_REPORT="${PORT_REPORT}${p}=free;"
  fi
done

python3 - <<PY
import json
from pathlib import Path
data = {
  "programme": "APZHUB-OPS-002",
  "timestamp": "${STAMP}",
  "disk": {"usePercent": int("${DISK_USE}"), "available": "${DISK_AVAIL}", "status": "${DISK_STATUS}"},
  "memoryAvailableGbApprox": float("${MEM_AVAIL}" or 0),
  "hostCoexistenceLive": "${COEXIST}",
  "reservedPorts": "${PORT_REPORT}",
  "recommendations": [
    "Keep disk below 80% before cutover",
    "Run pnpm ops:host-coexistence-audit -- --live immediately before Change",
    "Postgres volume growth: monitor apzhub_postgres_prod",
    "Redis maxmemory 384mb (prod conf) — sessions are ephemeral-acceptable",
    "Web container memory limit 2G; scale vertically before horizontal on shared host"
  ],
  "verdict": "PASS" if "${DISK_STATUS}" != "critical" and "${COEXIST}" == "PASS" else "ATTENTION"
}
Path("${OUT}").write_text(json.dumps(data, indent=2) + "\n")
print(json.dumps(data, indent=2))
PY

# Also run dry coexistence if live failed hard
if [[ "${COEXIST_EXIT}" -ne 0 ]]; then
  pnpm ops:host-coexistence-audit || true
fi

[[ "${DISK_STATUS}" != "critical" ]]
