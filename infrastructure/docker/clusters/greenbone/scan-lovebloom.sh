#!/usr/bin/env bash
# Create target + Full and fast task for authorized lovebloom host, then export report.
# Prereq: feeds synced (NVT ready, get_configs non-empty). Password: .secrets/greenbone-admin
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
PASS="$(tr -d '\n' < /home/ubuntu/apz-portal/.secrets/greenbone-admin)"
HOST_NAME="${1:-lovebloom.apztdg.com}"
HOST_IP="${2:-}"
OUT_DIR="${APZTOOLS_ROOT:-/home/ubuntu/apztools}/security/out/greenbone/lovebloom"
mkdir -p "$OUT_DIR"

# Capture GMP XML only (strip docker compose chatter).
gmp() {
  local raw
  raw="$(
    docker compose -p apzqep-greenbone run --rm --no-deps gvm-tools \
      gvm-cli --gmp-username admin --gmp-password "$PASS" \
      socket --socketpath /run/gvmd/gvmd.sock --xml "$1" 2>/dev/null
  )"
  # Keep from first XML tag onward
  printf '%s' "$raw" | python3 -c '
import sys
s = sys.stdin.read()
i = s.find("<")
if i < 0:
    raise SystemExit("no GMP XML in response")
sys.stdout.write(s[i:])
'
}

xml_attr() {
  # usage: xml_attr '<root...>' id   OR pick nested text
  local xml="$1" mode="$2"
  XML="$xml" MODE="$mode" python3 -c '
import os, xml.etree.ElementTree as ET
root = ET.fromstring(os.environ["XML"])
mode = os.environ["MODE"]
if mode == "id":
    print(root.get("id") or "")
elif mode.startswith("text:"):
    print(root.findtext(mode.split(":",1)[1]) or "")
'
}

if [[ -z "$HOST_IP" ]]; then
  HOST_IP="$(python3 - <<PY
import socket
print(sorted({i[4][0] for i in socket.getaddrinfo("$HOST_NAME", 443, type=socket.SOCK_STREAM)})[0])
PY
)"
fi
echo "target=$HOST_NAME ip=$HOST_IP"

CONFIGS_XML="$(gmp '<get_configs/>')"
CONFIG_ID="$(
  CONFIGS_XML="$CONFIGS_XML" python3 -c '
import os, xml.etree.ElementTree as ET
root = ET.fromstring(os.environ["CONFIGS_XML"])
for c in root.findall(".//config"):
    if c.findtext("name") == "Full and fast":
        print(c.get("id")); raise SystemExit
raise SystemExit("Full and fast config missing — wait for GVMD_DATA feed sync")
'
)"

PORTS_XML="$(gmp '<get_port_lists/>')"
PORT_LIST_ID="$(
  PORTS_XML="$PORTS_XML" python3 -c '
import os, xml.etree.ElementTree as ET
root = ET.fromstring(os.environ["PORTS_XML"])
for pl in root.findall(".//port_list"):
    if pl.findtext("name") == "All IANA assigned TCP":
        print(pl.get("id")); raise SystemExit
pl = root.find(".//port_list")
print(pl.get("id") if pl is not None else "")
'
)"

SCANNERS_XML="$(gmp '<get_scanners/>')"
SCANNER_ID="$(
  SCANNERS_XML="$SCANNERS_XML" python3 -c '
import os, xml.etree.ElementTree as ET
root = ET.fromstring(os.environ["SCANNERS_XML"])
for s in root.findall(".//scanner"):
    if "OpenVAS" in (s.findtext("name") or ""):
        print(s.get("id")); raise SystemExit
s = root.find(".//scanner")
print(s.get("id") if s is not None else "")
'
)"
echo "config=$CONFIG_ID port_list=$PORT_LIST_ID scanner=$SCANNER_ID"
[[ -n "$CONFIG_ID" && -n "$PORT_LIST_ID" && -n "$SCANNER_ID" ]]

# ICMP often blocked on internet hosts — force Consider Alive so TCP/port NVTs still run.
TARGET_XML="$(gmp "<create_target><name>lovebloom-${HOST_IP}-alive</name><hosts>${HOST_IP}</hosts><port_list id=\"${PORT_LIST_ID}\"/><alive_tests>Consider Alive</alive_tests></create_target>")"
TARGET_ID="$(xml_attr "$TARGET_XML" id)"
echo "target_id=$TARGET_ID"
[[ -n "$TARGET_ID" ]]

TASK_XML="$(gmp "<create_task><name>lovebloom-full-and-fast-$(date +%s)</name><comment>APZQEP F11 authorized VA</comment><config id=\"${CONFIG_ID}\"/><target id=\"${TARGET_ID}\"/><scanner id=\"${SCANNER_ID}\"/></create_task>")"
TASK_ID="$(xml_attr "$TASK_XML" id)"
echo "task_id=$TASK_ID"
[[ -n "$TASK_ID" ]]

START_XML="$(gmp "<start_task task_id=\"${TASK_ID}\"/>")"
echo "started: $START_XML"

for i in $(seq 1 180); do
  TASKS_XML="$(gmp "<get_tasks task_id=\"${TASK_ID}\"/>")"
  st="$(
    TASKS_XML="$TASKS_XML" python3 -c '
import os, xml.etree.ElementTree as ET
root = ET.fromstring(os.environ["TASKS_XML"])
print(root.findtext(".//status") or "unknown")
'
  )"
  echo "$(date -u +%H:%M:%S) status=$st"
  if [[ "$st" == "Done" ]]; then
    break
  fi
  if [[ "$st" == "Stopped" || "$st" == "Interrupted" ]]; then
    echo "scan ended abnormally: $st"
    exit 1
  fi
  sleep 30
done

REPORT_ID="$(
  TASKS_XML="$(gmp "<get_tasks task_id=\"${TASK_ID}\"/>")"
  TASKS_XML="$TASKS_XML" python3 -c '
import os, xml.etree.ElementTree as ET
root = ET.fromstring(os.environ["TASKS_XML"])
r = root.find(".//last_report/report")
print(r.get("id") if r is not None else "")
'
)"
echo "report_id=$REPORT_ID"
[[ -n "$REPORT_ID" ]] || { echo "no report"; exit 1; }

gmp "<get_reports report_id=\"${REPORT_ID}\" details=\"1\"/>" > "$OUT_DIR/greenbone-report.xml"
REPORT_ID="$REPORT_ID" TASK_ID="$TASK_ID" HOST_NAME="$HOST_NAME" HOST_IP="$HOST_IP" OUT_DIR="$OUT_DIR" python3 - <<'PY'
import json, os, xml.etree.ElementTree as ET
from pathlib import Path

out = Path(os.environ["OUT_DIR"])
root = ET.fromstring((out / "greenbone-report.xml").read_text())
findings = []
for result in root.findall(".//result"):
    name = result.findtext("name") or ""
    sev = result.findtext("severity") or "0"
    threat = result.findtext("threat") or ""
    host = result.findtext("host") or ""
    try:
        sev_f = float(sev)
    except ValueError:
        sev_f = 0.0
    level = "note"
    if sev_f >= 7:
        level = "error"
    elif sev_f >= 4:
        level = "warning"
    findings.append(
        {
            "level": level,
            "severity": sev,
            "threat": threat,
            "message": name,
            "host": host,
        }
    )
report = {
    "ok": not any(f["level"] == "error" for f in findings),
    "findings": findings,
    "tool": "greenbone",
    "target": os.environ["HOST_NAME"],
    "hostIp": os.environ["HOST_IP"],
    "taskId": os.environ["TASK_ID"],
    "reportId": os.environ["REPORT_ID"],
}
(out / "greenbone-findings.json").write_text(json.dumps(report, indent=2))
print(
    "findings",
    len(findings),
    "errors",
    sum(1 for f in findings if f["level"] == "error"),
)
PY
echo "wrote $OUT_DIR/greenbone-report.xml and greenbone-findings.json"
