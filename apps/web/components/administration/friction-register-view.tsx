"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type {
  FrictionBoardDecision,
  FrictionEngineeringStatus,
  FrictionSource,
  OperationalFriction,
} from "@apzhub/platform-service-contracts";

import {
  createOperationalFriction,
  getOperationalFriction,
  listOperationalFriction,
  listOperationalFrictionAudit,
  updateOperationalFriction,
} from "@/lib/product-board/friction-api";

const PRODUCTS = [
  "projects",
  "support",
  "workflow",
  "documents",
  "law",
  "knowledge",
  "time",
  "analytics",
  "qep",
] as const;

function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-lg border border-[var(--color-border)] p-4">
      <h2 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-[var(--color-muted-foreground)]">{label}</span>
      {children}
    </label>
  );
}

function FrictionList({
  items,
  onOpen,
  onCreate,
}: {
  readonly items: readonly OperationalFriction[];
  readonly onOpen: (id: string) => void;
  readonly onCreate: () => void;
}) {
  return (
    <div className="space-y-4" data-testid="friction-register-list">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Mandatory entry point for Product Era investments.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={onCreate}
          data-testid="friction-create"
        >
          Record friction
        </Button>
      </div>
      {items.length === 0 ? (
        <p
          className="text-sm text-[var(--color-muted-foreground)]"
          data-testid="friction-empty"
        >
          No friction records yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] p-3 text-left hover:bg-[var(--color-muted)]/20"
                onClick={() => onOpen(item.id)}
                data-testid={`friction-row-${item.id}`}
              >
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {item.userRole} · {item.boardDecision} · {item.engineeringStatus}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FrictionForm({
  mode,
  initial,
  defaults,
  onCancel,
  onSaved,
}: {
  readonly mode: "create" | "edit";
  readonly initial?: OperationalFriction;
  readonly defaults?: Partial<{
    source: FrictionSource;
    evidence: string;
    frustration: string;
    productsAffected: string[];
  }>;
  readonly onCancel: () => void;
  readonly onSaved: (id: string) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [reporter, setReporter] = useState(initial?.reporter ?? "Product Board");
  const [userRole, setUserRole] = useState(initial?.userRole ?? "Project Manager");
  const [products, setProducts] = useState<string[]>(
    initial
      ? [...initial.productsAffected]
      : (defaults?.productsAffected ?? ["projects"]),
  );
  const [frustration, setFrustration] = useState(
    initial?.frustration ?? defaults?.frustration ?? "",
  );
  const [whoExperiences, setWhoExperiences] = useState(
    initial?.whoExperiences ?? userRole,
  );
  const [evidence, setEvidence] = useState(
    initial?.evidence ?? defaults?.evidence ?? "",
  );
  const [nonEngineeringOptions, setNonEngineeringOptions] = useState(
    initial?.nonEngineeringOptions ?? "",
  );
  const [smallestCapability, setSmallestCapability] = useState(
    initial?.smallestCapability ?? "",
  );
  const [boardDecision, setBoardDecision] = useState<FrictionBoardDecision>(
    initial?.boardDecision ?? "needs_more_evidence",
  );
  const [engineeringStatus, setEngineeringStatus] = useState<FrictionEngineeringStatus>(
    initial?.engineeringStatus ?? "no_engineering",
  );
  const [outcomeFaster, setOutcomeFaster] = useState<boolean | null>(
    initial?.outcomeFaster ?? null,
  );
  const [outcomeClearer, setOutcomeClearer] = useState<boolean | null>(
    initial?.outcomeClearer ?? null,
  );
  const [outcomeSafer, setOutcomeSafer] = useState<boolean | null>(
    initial?.outcomeSafer ?? null,
  );
  const [outcomeBetterDecision, setOutcomeBetterDecision] = useState<boolean | null>(
    initial?.outcomeBetterDecision ?? null,
  );
  const [outcomeNotes, setOutcomeNotes] = useState(initial?.outcomeNotes ?? "");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") {
        return createOperationalFriction({
          title,
          reporter,
          userRole,
          productsAffected: products,
          frustration,
          whoExperiences,
          evidence,
          nonEngineeringOptions,
          smallestCapability,
          boardDecision,
          engineeringStatus,
          source: defaults?.source ?? "manual",
        });
      }
      return updateOperationalFriction(initial!.id, {
        title,
        reporter,
        userRole,
        productsAffected: products,
        frustration,
        whoExperiences,
        evidence,
        nonEngineeringOptions,
        smallestCapability,
        boardDecision,
        engineeringStatus,
        outcomeFaster,
        outcomeClearer,
        outcomeSafer,
        outcomeBetterDecision,
        outcomeNotes: outcomeNotes || null,
      });
    },
    onSuccess: (saved) => onSaved(saved.id),
    onError: (err: unknown) =>
      setError(err instanceof Error ? err.message : "Save failed"),
  });

  const toggleProduct = (product: string) => {
    setProducts((current) =>
      current.includes(product)
        ? current.filter((item) => item !== product)
        : [...current, product],
    );
  };

  return (
    <div className="space-y-4" data-testid="friction-form">
      <Section title="Basic information">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="friction-title"
            />
          </Field>
          <Field label="Reporter">
            <Input value={reporter} onChange={(e) => setReporter(e.target.value)} />
          </Field>
          <Field label="User role">
            <Input value={userRole} onChange={(e) => setUserRole(e.target.value)} />
          </Field>
          <Field label="Products affected">
            <div className="flex flex-wrap gap-2">
              {PRODUCTS.map((product) => (
                <Button
                  key={product}
                  type="button"
                  size="sm"
                  variant={products.includes(product) ? "default" : "outline"}
                  onClick={() => toggleProduct(product)}
                >
                  {product}
                </Button>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Five-question filter">
        <Field label="1. What is the user frustration?">
          <textarea
            className="min-h-20 rounded-md border border-[var(--color-border)] bg-transparent p-2"
            value={frustration}
            onChange={(e) => setFrustration(e.target.value)}
            data-testid="friction-q1"
          />
        </Field>
        <Field label="2. Who experiences it?">
          <Input
            value={whoExperiences}
            onChange={(e) => setWhoExperiences(e.target.value)}
            data-testid="friction-q2"
          />
        </Field>
        <Field label="3. What evidence supports it?">
          <textarea
            className="min-h-20 rounded-md border border-[var(--color-border)] bg-transparent p-2"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            data-testid="friction-q3"
          />
        </Field>
        <Field label="4. Can it be solved without engineering?">
          <textarea
            className="min-h-20 rounded-md border border-[var(--color-border)] bg-transparent p-2"
            value={nonEngineeringOptions}
            onChange={(e) => setNonEngineeringOptions(e.target.value)}
            data-testid="friction-q4"
          />
        </Field>
        <Field label="5. If engineering is required, what is the smallest capability?">
          <textarea
            className="min-h-20 rounded-md border border-[var(--color-border)] bg-transparent p-2"
            value={smallestCapability}
            onChange={(e) => setSmallestCapability(e.target.value)}
            data-testid="friction-q5"
          />
        </Field>
      </Section>

      <Section title="Product Board decision">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Decision">
            <select
              className="rounded-md border border-[var(--color-border)] bg-transparent p-2"
              value={boardDecision}
              onChange={(e) =>
                setBoardDecision(e.target.value as FrictionBoardDecision)
              }
              data-testid="friction-decision"
            >
              <option value="accepted">Accepted</option>
              <option value="deferred">Deferred</option>
              <option value="rejected">Rejected</option>
              <option value="needs_more_evidence">Needs More Evidence</option>
            </select>
          </Field>
          <Field label="Engineering status">
            <select
              className="rounded-md border border-[var(--color-border)] bg-transparent p-2"
              value={engineeringStatus}
              onChange={(e) =>
                setEngineeringStatus(e.target.value as FrictionEngineeringStatus)
              }
              data-testid="friction-engineering"
            >
              <option value="no_engineering">No Engineering</option>
              <option value="apzqep_candidate">APZQEP Candidate</option>
              <option value="approved">Approved</option>
              <option value="delivered">Delivered</option>
            </select>
          </Field>
        </div>
      </Section>

      {mode === "edit" ? (
        <Section title="Outcome (after delivery)">
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["Faster", outcomeFaster, setOutcomeFaster],
                ["Clearer", outcomeClearer, setOutcomeClearer],
                ["Safer", outcomeSafer, setOutcomeSafer],
                ["Better decisions", outcomeBetterDecision, setOutcomeBetterDecision],
              ] as const
            ).map(([label, value, setter]) => (
              <Field key={label} label={label}>
                <select
                  className="rounded-md border border-[var(--color-border)] bg-transparent p-2"
                  value={value === null ? "" : value ? "yes" : "no"}
                  onChange={(e) =>
                    setter(e.target.value === "" ? null : e.target.value === "yes")
                  }
                >
                  <option value="">Unset</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
            ))}
          </div>
          <Field label="Outcome notes">
            <textarea
              className="min-h-16 rounded-md border border-[var(--color-border)] bg-transparent p-2"
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
            />
          </Field>
        </Section>
      ) : null}

      {error ? (
        <p
          className="text-sm text-[var(--color-destructive)]"
          data-testid="friction-error"
        >
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          data-testid="friction-save"
        >
          Save
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function FrictionDetail({
  id,
  onBack,
  onEdit,
}: {
  readonly id: string;
  readonly onBack: () => void;
  readonly onEdit: () => void;
}) {
  const detailQuery = useQuery({
    queryKey: ["friction", id],
    queryFn: ({ signal }) => getOperationalFriction(id, { signal }),
  });
  const auditQuery = useQuery({
    queryKey: ["friction-audit", id],
    queryFn: ({ signal }) => listOperationalFrictionAudit(id, { signal }),
  });

  const item = detailQuery.data;

  return (
    <div className="space-y-4" data-testid="friction-detail">
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" size="sm" onClick={onEdit} data-testid="friction-edit">
          Review / update
        </Button>
      </div>
      {item ? (
        <>
          <Section title={item.title}>
            <p className="text-sm">{item.frustration}</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              {item.userRole} · {item.boardDecision} · {item.engineeringStatus} ·{" "}
              {item.source}
            </p>
          </Section>
          <Section title="Five-question answers">
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              <li>{item.frustration}</li>
              <li>{item.whoExperiences}</li>
              <li>{item.evidence}</li>
              <li>{item.nonEngineeringOptions}</li>
              <li>{item.smallestCapability}</li>
            </ol>
          </Section>
          <Section title="Audit history">
            <ul className="space-y-1 text-xs" data-testid="friction-audit">
              {(auditQuery.data ?? []).map((entry) => (
                <li key={entry.id}>
                  {entry.createdAt} · {entry.action} · {entry.actorUserId}
                </li>
              ))}
            </ul>
          </Section>
        </>
      ) : (
        <p role="status">Loading…</p>
      )}
    </div>
  );
}

/** Product Board Operational Friction Register. */
export function FrictionRegisterView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const view = searchParams.get("view") ?? "list";
  const id = searchParams.get("id");
  const source = (searchParams.get("source") as FrictionSource | null) ?? undefined;

  const listQuery = useQuery({
    queryKey: ["friction-register"],
    queryFn: ({ signal }) => listOperationalFriction({ signal }),
  });

  const createDefaults = useMemo(() => {
    if (source === "context_learning") {
      return {
        source: "context_learning" as const,
        productsAffected: ["projects"],
        evidence:
          "Derived from Enterprise Context Product Learning (pilot metrics / feedback).",
        frustration: "",
      };
    }
    if (source === "support") {
      return {
        source: "support" as const,
        productsAffected: ["support"],
        evidence: "Support operational observation.",
        frustration: "",
      };
    }
    return { source: source ?? ("manual" as const) };
  }, [source]);

  const setView = (next: string, nextId?: string) => {
    const params = new URLSearchParams();
    params.set("view", next);
    if (nextId) params.set("id", nextId);
    router.push(`/workspace/administration/friction-register?${params.toString()}`);
  };

  useEffect(() => {
    if (view === "list") {
      void listQuery.refetch();
    }
  }, [view]);

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="friction-register">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Product Board
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
          Operational Friction Register
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Capture validated user frustrations before any Product Era engineering
          investment.
        </p>
      </header>

      {view === "list" ? (
        <FrictionList
          items={listQuery.data ?? []}
          onOpen={(frictionId) => setView("detail", frictionId)}
          onCreate={() => setView("create")}
        />
      ) : null}

      {view === "create" ? (
        <FrictionForm
          mode="create"
          defaults={createDefaults}
          onCancel={() => setView("list")}
          onSaved={async (frictionId) => {
            await queryClient.invalidateQueries({ queryKey: ["friction-register"] });
            setView("detail", frictionId);
          }}
        />
      ) : null}

      {view === "detail" && id ? (
        <FrictionDetail
          id={id}
          onBack={() => setView("list")}
          onEdit={() => setView("edit", id)}
        />
      ) : null}

      {view === "edit" && id ? (
        <FrictionEditLoader
          id={id}
          onCancel={() => setView("detail", id)}
          onSaved={async () => {
            await queryClient.invalidateQueries({ queryKey: ["friction-register"] });
            await queryClient.invalidateQueries({ queryKey: ["friction", id] });
            setView("detail", id);
          }}
        />
      ) : null}
    </div>
  );
}

function FrictionEditLoader({
  id,
  onCancel,
  onSaved,
}: {
  readonly id: string;
  readonly onCancel: () => void;
  readonly onSaved: () => void;
}) {
  const query = useQuery({
    queryKey: ["friction", id],
    queryFn: ({ signal }) => getOperationalFriction(id, { signal }),
  });
  if (!query.data) return <p role="status">Loading…</p>;
  return (
    <FrictionForm
      mode="edit"
      initial={query.data}
      onCancel={onCancel}
      onSaved={() => onSaved()}
    />
  );
}
