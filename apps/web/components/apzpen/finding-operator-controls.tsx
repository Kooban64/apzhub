"use client";

import { useState } from "react";

import type { Finding, FindingSeverity } from "@/lib/apzpen/types";

export type FindingActionPayload = Record<string, unknown>;

export function FindingStatusButtons({
  finding,
  onAction,
  pending,
}: {
  finding: Finding;
  onAction: (payload: FindingActionPayload) => void;
  pending?: boolean;
}) {
  const canLifecycle = finding.status === "open" || finding.status === "remediating";
  const canClose =
    finding.status === "retest_passed" ||
    finding.status === "retest_failed" ||
    finding.status === "remediating";

  return (
    <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
      {finding.status === "open" ? (
        <button
          type="button"
          className="text-[11px] underline disabled:opacity-50"
          disabled={pending}
          onClick={() =>
            onAction({
              action: "update_status",
              findingId: finding.findingId,
              status: "remediating",
            })
          }
        >
          Remediate
        </button>
      ) : null}
      {canLifecycle ? (
        <button
          type="button"
          className="text-[11px] underline disabled:opacity-50"
          disabled={pending}
          onClick={() =>
            onAction({
              action: "request_retest",
              findingId: finding.findingId,
            })
          }
        >
          Retest
        </button>
      ) : null}
      {canLifecycle ? (
        <button
          type="button"
          className="text-[11px] underline disabled:opacity-50"
          disabled={pending}
          onClick={() =>
            onAction({
              action: "update_status",
              findingId: finding.findingId,
              status: "false_positive",
            })
          }
        >
          FP
        </button>
      ) : null}
      {canLifecycle ? (
        <button
          type="button"
          className="text-[11px] underline disabled:opacity-50"
          disabled={pending}
          onClick={() =>
            onAction({
              action: "update_status",
              findingId: finding.findingId,
              status: "risk_accepted",
            })
          }
        >
          Accept
        </button>
      ) : null}
      {canClose ? (
        <button
          type="button"
          className="text-[11px] underline disabled:opacity-50"
          disabled={pending}
          onClick={() =>
            onAction({
              action: "update_status",
              findingId: finding.findingId,
              status: "closed",
            })
          }
        >
          Close
        </button>
      ) : null}
      {finding.status === "retest_requested" ? (
        <>
          <button
            type="button"
            className="text-[11px] underline disabled:opacity-50"
            disabled={pending}
            onClick={() =>
              onAction({
                action: "update_status",
                findingId: finding.findingId,
                status: "retest_passed",
              })
            }
          >
            Pass
          </button>
          <button
            type="button"
            className="text-[11px] underline disabled:opacity-50"
            disabled={pending}
            onClick={() =>
              onAction({
                action: "update_status",
                findingId: finding.findingId,
                status: "retest_failed",
              })
            }
          >
            Fail
          </button>
        </>
      ) : null}
    </span>
  );
}

export function FindingAssignEvidenceForm({
  finding,
  onAction,
  pending,
  onVaultUploaded,
}: {
  finding: Finding;
  onAction: (payload: FindingActionPayload) => void;
  pending?: boolean;
  onVaultUploaded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [assignTo, setAssignTo] = useState(finding.assignedTo ?? "");
  const [label, setLabel] = useState("");
  const [ref, setRef] = useState("");
  const [vaultBusy, setVaultBusy] = useState(false);
  const [vaultMsg, setVaultMsg] = useState<string | null>(null);

  return (
    <div className="mt-1">
      <button
        type="button"
        className="text-[11px] underline"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide assign / evidence" : "Assign / evidence"}
      </button>
      {open ? (
        <div className="mt-2 max-w-md space-y-2 rounded border border-dashed border-[var(--color-border)] p-2">
          <div className="flex flex-wrap gap-2">
            <input
              className="min-w-[140px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
              placeholder="Assignee email"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              aria-label={`Assignee for ${finding.title}`}
            />
            <button
              type="button"
              className="text-[11px] underline disabled:opacity-50"
              disabled={!assignTo.trim() || pending}
              onClick={() =>
                onAction({
                  action: "assign",
                  findingId: finding.findingId,
                  assignedTo: assignTo.trim(),
                })
              }
            >
              Assign
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              className="min-w-[120px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
              placeholder="Evidence label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              aria-label={`Evidence label for ${finding.title}`}
            />
            <input
              className="min-w-[140px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
              placeholder="Evidence URL / ref"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              aria-label={`Evidence ref for ${finding.title}`}
            />
            <button
              type="button"
              className="text-[11px] underline disabled:opacity-50"
              disabled={!label.trim() || !ref.trim() || pending}
              onClick={() => {
                onAction({
                  action: "add_evidence",
                  findingId: finding.findingId,
                  evidenceKind: "note",
                  evidenceLabel: label.trim(),
                  evidenceRef: ref.trim(),
                });
                setLabel("");
                setRef("");
              }}
            >
              Attach
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center text-[11px] underline">
              Upload to vault
              <input
                type="file"
                className="sr-only"
                disabled={vaultBusy || pending}
                aria-label={`Upload vault evidence for ${finding.title}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setVaultBusy(true);
                  setVaultMsg(null);
                  const form = new FormData();
                  form.set("findingId", finding.findingId);
                  form.set("label", label.trim() || file.name);
                  form.set("file", file);
                  void fetch("/api/v1/apzpen/evidence/vault", {
                    method: "POST",
                    body: form,
                  })
                    .then(async (res) => {
                      const body = await res.json();
                      if (!res.ok) {
                        throw new Error(body?.error?.message ?? "Vault upload failed");
                      }
                      setVaultMsg(
                        `Vault ${body.data?.object?.objectId ?? "ok"} · ${body.data?.object?.sha256?.slice(0, 12) ?? ""}…`,
                      );
                      setLabel("");
                      onVaultUploaded?.();
                    })
                    .catch((err: Error) => setVaultMsg(err.message))
                    .finally(() => {
                      setVaultBusy(false);
                      e.target.value = "";
                    });
                }}
              />
            </label>
            {vaultMsg ? (
              <span className="text-[10px] text-[var(--color-muted-foreground)]">
                {vaultMsg}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ManualFindingCreateForm({
  engagementId,
  onAction,
  pending,
}: {
  engagementId: string;
  onAction: (payload: FindingActionPayload) => void;
  pending?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<FindingSeverity>("medium");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [remediation, setRemediation] = useState("");
  const [cwe, setCwe] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[180px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
          placeholder="Finding title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Manual finding title"
        />
        <select
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as FindingSeverity)}
          aria-label="Severity"
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
      </div>
      <textarea
        className="min-h-[64px] w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-[11px]"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        aria-label="Manual finding description"
      />
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[120px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
          placeholder="Location (URL / path)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="min-w-[100px] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
          placeholder="CWE-79"
          value={cwe}
          onChange={(e) => setCwe(e.target.value)}
        />
      </div>
      <input
        className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[11px]"
        placeholder="Remediation guidance"
        value={remediation}
        onChange={(e) => setRemediation(e.target.value)}
      />
      <button
        type="button"
        data-testid="apzpen-manual-finding-create"
        className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px] hover:bg-[var(--color-muted)] disabled:opacity-50"
        disabled={!title.trim() || !description.trim() || pending}
        onClick={() => {
          onAction({
            action: "create",
            engagementId,
            title: title.trim(),
            description: description.trim(),
            severity,
            location: location.trim() || undefined,
            remediation: remediation.trim() || undefined,
            cwe: cwe.trim() || undefined,
          });
          setTitle("");
          setDescription("");
          setLocation("");
          setRemediation("");
          setCwe("");
          setSeverity("medium");
        }}
      >
        Record finding
      </button>
    </div>
  );
}
