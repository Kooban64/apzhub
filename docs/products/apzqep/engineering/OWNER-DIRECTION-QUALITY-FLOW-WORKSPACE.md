# OWNER DIRECTION — Quality Flow Workspace

| Field      | Value                                                                                |
| ---------- | ------------------------------------------------------------------------------------ |
| Document   | **OWNER-DIRECTION-QUALITY-FLOW-WORKSPACE**                                           |
| Timestamp  | 20260807T184600Z                                                                     |
| Authority  | Owner                                                                                |
| Status     | **IN FORCE**                                                                         |
| Inventory  | [APZQEP-PRODUCTION-READY-CLOSEOUT.md](./APZQEP-PRODUCTION-READY-CLOSEOUT.md)         |
| Prior auth | [OWNER-DECISION-V1.1-PRODUCTION-READY.md](./OWNER-DECISION-V1.1-PRODUCTION-READY.md) |

---

## Engineering Priority

Continue Production Readiness.

No change to the accepted closeout inventory.

---

## Product Priority

The highest remaining product capability is:

**Quality Flow Workspace** (QX-P1-03)

This is the primary operational workspace for APZQEP Version 1.1.

- Expose the existing orchestration engine
- **No new orchestration behaviour is authorised**
- Not a workflow designer, BPM tool, or admin screen

---

## Workspace Objective

A Quality Lead shall answer from one screen:

- What Quality Flows are active?
- Which stage is each flow in?
- What is waiting?
- What failed?
- What evidence is outstanding?
- Which approvals are required?
- Which releases are blocked?
- What changed recently?
- What must happen next?

---

## Required Capabilities

- Quality Flow list
- Flow detail
- Flow timeline
- Stage progression
- Gate status
- Approval status
- Evidence status
- Decision Packages
- Waiting items
- Exception state
- Operational history

Reuse `@apzhub/platform-orchestration`. Do not duplicate orchestration logic.

---

## Design Principle

Operational command centre — users operate Quality Flows; engineers maintain orchestration.

---

## Engineering Rule

Finish the Quality Flow Workspace before secondary UX refinement on Waves 1–4.

Leave foundation domains and Caps A–F alone unless Hardening exposes defects.

Objective unchanged:

**APZQEP Version 1.1 – Enterprise Quality Baseline – Production Ready.**
