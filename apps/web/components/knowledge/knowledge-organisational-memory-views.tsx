"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isKnowledgeApiError } from "@/lib/knowledge/errors";
import { filterMemoryObjects } from "@/lib/knowledge/filter-memory-objects";
import {
  createDecisionKnowledge,
  createKnowledgeLesson,
  createKnowledgeLibraryItem,
  getKnowledgeObject,
  getKnowledgeQuality,
  listKnowledgeObjects,
  transitionKnowledgeLifecycle,
  type KnowledgeLibraryCategory,
  type KnowledgeLifecycleStatus,
  type KnowledgeObject,
} from "@/lib/knowledge/organisational-memory-api";
import {
  canManageKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import {
  knowledgeMemoryObjectPath,
  knowledgeQualityPath,
} from "@/lib/knowledge/routes";

import { EnterpriseContextPanel } from "@/components/context/enterprise-context-panel";

import {
  EmptyState,
  ErrorState,
  KNOWLEDGE_PRODUCT_NAME,
  KnowledgeWorkspaceFrame,
  LoadingState,
  PageShell,
} from "./knowledge-ui";

const keys = {
  objects: (kind?: string) => ["knowledge", "objects", kind ?? "all"] as const,
  object: (id: string) => ["knowledge", "object", id] as const,
  quality: ["knowledge", "quality"] as const,
};

const LIBRARY_CATEGORIES: readonly {
  readonly id: KnowledgeLibraryCategory;
  readonly label: string;
}[] = [
  { id: "standards", label: "Standards" },
  { id: "procedures", label: "Procedures" },
  { id: "best_practices", label: "Best practices" },
  { id: "operational_guides", label: "Operational guides" },
  { id: "reference_material", label: "Reference material" },
];

const LIFECYCLE: readonly KnowledgeLifecycleStatus[] = [
  "draft",
  "review",
  "approved",
  "archived",
];

function ObjectCard({
  item,
  onOpen,
}: {
  readonly item: KnowledgeObject;
  readonly onOpen: () => void;
}) {
  return (
    <li className="rounded-lg border border-[var(--color-border)] p-4">
      <button
        type="button"
        className="w-full text-left"
        onClick={onOpen}
        data-testid={`knowledge-object-${item.id}`}
      >
        <div className="font-medium">{item.title}</div>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {item.summary}
        </p>
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          {item.status} · v{item.version} · Owner: {item.owner}
        </p>
      </button>
    </li>
  );
}

export function KnowledgeLessonsView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageKnowledge(permissions);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [context, setContext] = useState("");
  const [situation, setSituation] = useState("");
  const [resolution, setResolution] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [owner, setOwner] = useState("");
  const [findQuery, setFindQuery] = useState("");

  const query = useQuery({
    queryKey: keys.objects("lesson"),
    queryFn: ({ signal }) => listKnowledgeObjects("lesson", { signal }),
  });
  const filtered = filterMemoryObjects(query.data ?? [], findQuery);

  const createMutation = useMutation({
    mutationFn: () =>
      createKnowledgeLesson({
        title,
        summary,
        context,
        situation,
        resolution,
        recommendation,
        owner,
        relatedProducts: ["APZ Projects"],
        tags: ["lesson"],
        reviewDate: "2099-01-01T00:00:00.000Z",
      }),
    onSuccess: async () => {
      setTitle("");
      setSummary("");
      setContext("");
      setSituation("");
      setResolution("");
      setRecommendation("");
      setOwner("");
      await queryClient.invalidateQueries({ queryKey: keys.objects("lesson") });
      await queryClient.invalidateQueries({ queryKey: keys.quality });
    },
  });

  return (
    <PageShell
      title="Operational lessons"
      description="Structured organisational lessons — first-class memory objects, never operational truth."
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Lessons"]}
    >
      {canManage ? (
        <form
          className="mb-6 grid gap-2 rounded-lg border border-[var(--color-border)] p-4"
          data-testid="knowledge-lesson-form"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <h2 className="text-sm font-semibold">Capture a lesson</h2>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="knowledge-lesson-title"
          />
          <Input
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <Input
            placeholder="Context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <Input
            placeholder="Situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
          <Input
            placeholder="Resolution"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
          <Input
            placeholder="Recommendation"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
          />
          <Input
            placeholder="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending}
            data-testid="knowledge-lesson-submit"
          >
            Save lesson
          </Button>
        </form>
      ) : null}

      {query.isSuccess && query.data.length > 0 ? (
        <div className="mb-4">
          <Input
            placeholder="Find lessons by title, tag, status, or owner"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            data-testid="knowledge-lessons-find"
          />
        </div>
      ) : null}

      {query.isLoading ? <LoadingState label="Loading lessons…" /> : null}
      {query.isError ? (
        <ErrorState
          title="Unable to load lessons"
          description={
            isKnowledgeApiError(query.error)
              ? query.error.message
              : "Organisational lessons could not be loaded."
          }
        />
      ) : null}
      {query.isSuccess ? (
        query.data.length === 0 ? (
          <EmptyState
            title="No lessons captured yet"
            description="Capture operational learning so the organisation improves over time."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No lessons match"
            description="Clear the find field or try another term."
          />
        ) : (
          <ul className="flex flex-col gap-3" data-testid="knowledge-lessons-list">
            {filtered.map((item) => (
              <ObjectCard
                key={item.id}
                item={item}
                onOpen={() => router.push(knowledgeMemoryObjectPath(item.id))}
              />
            ))}
          </ul>
        )
      ) : null}
    </PageShell>
  );
}

export function KnowledgeLibraryView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageKnowledge(permissions);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [owner, setOwner] = useState("");
  const [category, setCategory] = useState<KnowledgeLibraryCategory>("best_practices");
  const [findQuery, setFindQuery] = useState("");

  const query = useQuery({
    queryKey: keys.objects("library"),
    queryFn: async ({ signal }) => {
      const kinds = [
        "standard",
        "procedure",
        "best_practice",
        "operational_guide",
        "reference",
      ] as const;
      const batches = await Promise.all(
        kinds.map((kind) => listKnowledgeObjects(kind, { signal })),
      );
      return batches.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  });
  const filtered = filterMemoryObjects(query.data ?? [], findQuery);

  const createMutation = useMutation({
    mutationFn: () =>
      createKnowledgeLibraryItem({
        title,
        summary,
        content,
        owner,
        libraryCategory: category,
        reviewDate: "2099-06-01T00:00:00.000Z",
      }),
    onSuccess: async () => {
      setTitle("");
      setSummary("");
      setContent("");
      setOwner("");
      await queryClient.invalidateQueries({ queryKey: keys.objects("library") });
      await queryClient.invalidateQueries({ queryKey: keys.quality });
    },
  });

  return (
    <PageShell
      title="Best practice library"
      description="Curated standards, procedures, practices, guides and reference material — with ownership."
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Library"]}
    >
      {canManage ? (
        <form
          className="mb-6 grid gap-2 rounded-lg border border-[var(--color-border)] p-4"
          data-testid="knowledge-library-form"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <h2 className="text-sm font-semibold">Add library item</h2>
          <div className="flex flex-wrap gap-2">
            {LIBRARY_CATEGORIES.map((entry) => (
              <Button
                key={entry.id}
                type="button"
                size="sm"
                variant={category === entry.id ? "default" : "outline"}
                onClick={() => setCategory(entry.id)}
              >
                {entry.label}
              </Button>
            ))}
          </div>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="knowledge-library-title"
          />
          <Input
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <Input
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Input
            placeholder="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending}
            data-testid="knowledge-library-submit"
          >
            Save to library
          </Button>
        </form>
      ) : null}

      {query.isLoading ? <LoadingState label="Loading library…" /> : null}
      {query.isError ? (
        <ErrorState
          title="Unable to load library"
          description={
            isKnowledgeApiError(query.error)
              ? query.error.message
              : "Best practice library could not be loaded."
          }
        />
      ) : null}
      {query.isSuccess && query.data.length > 0 ? (
        <div className="mb-4">
          <Input
            placeholder="Find library items by title, tag, status, or owner"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            data-testid="knowledge-library-find"
          />
        </div>
      ) : null}
      {query.isSuccess ? (
        query.data.length === 0 ? (
          <EmptyState
            title="Library is empty"
            description="Curate proven practices so teams work consistently."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No library items match"
            description="Clear the find field or try another term."
          />
        ) : (
          <ul className="flex flex-col gap-3" data-testid="knowledge-library-list">
            {filtered.map((item) => (
              <ObjectCard
                key={item.id}
                item={item}
                onOpen={() => router.push(knowledgeMemoryObjectPath(item.id))}
              />
            ))}
          </ul>
        )
      ) : null}
    </PageShell>
  );
}

export function KnowledgeDecisionKnowledgeView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageKnowledge(permissions);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [rationale, setRationale] = useState("");
  const [owner, setOwner] = useState("");
  const [decisionRef, setDecisionRef] = useState("");
  const [findQuery, setFindQuery] = useState("");

  const query = useQuery({
    queryKey: keys.objects("decision_knowledge"),
    queryFn: ({ signal }) => listKnowledgeObjects("decision_knowledge", { signal }),
  });
  const filtered = filterMemoryObjects(query.data ?? [], findQuery);

  const createMutation = useMutation({
    mutationFn: () =>
      createDecisionKnowledge({
        title,
        summary,
        rationale,
        owner,
        decisionRef,
        relatedProducts: ["APZ Analytics"],
      }),
    onSuccess: async () => {
      setTitle("");
      setSummary("");
      setRationale("");
      setOwner("");
      setDecisionRef("");
      await queryClient.invalidateQueries({
        queryKey: keys.objects("decision_knowledge"),
      });
      await queryClient.invalidateQueries({ queryKey: keys.quality });
    },
  });

  return (
    <PageShell
      title="Decision knowledge"
      description="Knowledge references significant decisions. It does not own them."
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Decision knowledge"]}
    >
      {canManage ? (
        <form
          className="mb-6 grid gap-2 rounded-lg border border-[var(--color-border)] p-4"
          data-testid="knowledge-decision-form"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <h2 className="text-sm font-semibold">Link decision knowledge</h2>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="knowledge-decision-title"
          />
          <Input
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <Input
            placeholder="Rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
          />
          <Input
            placeholder="Decision reference (external id)"
            value={decisionRef}
            onChange={(e) => setDecisionRef(e.target.value)}
            data-testid="knowledge-decision-ref"
          />
          <Input
            placeholder="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending}
            data-testid="knowledge-decision-submit"
          >
            Save decision knowledge
          </Button>
        </form>
      ) : null}

      {query.isSuccess && query.data.length > 0 ? (
        <div className="mb-4">
          <Input
            placeholder="Find decision knowledge by title, tag, status, or owner"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            data-testid="knowledge-decision-find"
          />
        </div>
      ) : null}
      {query.isLoading ? <LoadingState label="Loading decision knowledge…" /> : null}
      {query.isError ? (
        <ErrorState
          title="Unable to load decision knowledge"
          description={
            isKnowledgeApiError(query.error)
              ? query.error.message
              : "Decision knowledge could not be loaded."
          }
        />
      ) : null}
      {query.isSuccess ? (
        query.data.length === 0 ? (
          <EmptyState
            title="No decision knowledge yet"
            description="Preserve rationale by reference — decisions stay owned by their Systems of Record."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No decision knowledge matches"
            description="Clear the find field or try another term."
          />
        ) : (
          <ul className="flex flex-col gap-3" data-testid="knowledge-decision-list">
            {filtered.map((item) => (
              <ObjectCard
                key={item.id}
                item={item}
                onOpen={() => router.push(knowledgeMemoryObjectPath(item.id))}
              />
            ))}
          </ul>
        )
      ) : null}
    </PageShell>
  );
}

export function KnowledgeQualityView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();
  const canManage = canManageKnowledge(permissions);
  const query = useQuery({
    queryKey: keys.quality,
    queryFn: ({ signal }) => getKnowledgeQuality({ signal }),
  });

  return (
    <PageShell
      title="Knowledge quality"
      description="Rule-based governance — ownership, review dates, expiry, duplicates and stale content. No AI."
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Quality"]}
      actions={
        canManage ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void query.refetch()}
            data-testid="knowledge-quality-refresh"
          >
            Refresh
          </Button>
        ) : null
      }
    >
      {query.isLoading ? <LoadingState label="Computing quality…" /> : null}
      {query.isError ? (
        <ErrorState
          title="Unable to load quality report"
          description={
            isKnowledgeApiError(query.error)
              ? query.error.message
              : "Knowledge quality could not be computed."
          }
        />
      ) : null}
      {query.isSuccess ? (
        <div data-testid="knowledge-quality-report">
          <dl className="mb-4 grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <dt className="text-[var(--color-muted-foreground)]">Total</dt>
              <dd className="text-lg font-semibold">{query.data.totalObjects}</dd>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <dt className="text-[var(--color-muted-foreground)]">Approved</dt>
              <dd className="text-lg font-semibold">{query.data.approvedCount}</dd>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <dt className="text-[var(--color-muted-foreground)]">
                Stale / duplicate
              </dt>
              <dd className="text-lg font-semibold">
                {query.data.staleCount} / {query.data.duplicateGroups}
              </dd>
            </div>
          </dl>
          {query.data.issues.length === 0 ? (
            <EmptyState
              title="No quality issues"
              description="Ownership, review dates and uniqueness look healthy."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {query.data.issues.map((issue) => (
                <li
                  key={`${issue.objectId}-${issue.code}`}
                  className="rounded-lg border border-[var(--color-border)] p-3 text-sm"
                >
                  <button
                    type="button"
                    className="text-left"
                    onClick={() =>
                      router.push(knowledgeMemoryObjectPath(issue.objectId))
                    }
                  >
                    <span className="font-medium">{issue.title}</span>
                    <span className="ml-2 text-xs uppercase text-[var(--color-muted-foreground)]">
                      {issue.severity} · {issue.code}
                    </span>
                    <p className="mt-1 text-[var(--color-muted-foreground)]">
                      {issue.message}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </PageShell>
  );
}

export function KnowledgeManagedObjectDetailView({
  objectId,
  permissions,
}: {
  readonly objectId: string;
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const canManage = canManageKnowledge(permissions);
  const query = useQuery({
    queryKey: keys.object(objectId),
    queryFn: ({ signal }) => getKnowledgeObject(objectId, { signal }),
  });

  const lifecycleMutation = useMutation({
    mutationFn: (status: KnowledgeLifecycleStatus) =>
      transitionKnowledgeLifecycle(objectId, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.object(objectId) });
      await queryClient.invalidateQueries({ queryKey: ["knowledge", "objects"] });
      await queryClient.invalidateQueries({ queryKey: keys.quality });
    },
  });

  if (query.isLoading) {
    return (
      <PageShell title="Memory" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Memory"]}>
        <LoadingState />
      </PageShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageShell title="Not found" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Memory"]}>
        <EmptyState
          title="Memory object not found"
          description="This organisational memory object is not available."
        />
      </PageShell>
    );
  }

  const item = query.data;
  const bodyEntries = Object.entries(item.body);

  return (
    <PageShell
      title={item.title}
      description={`${item.kind.replaceAll("_", " ")} · ${item.status} · v${item.version}`}
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Memory", item.title]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void query.refetch()}
        >
          Refresh
        </Button>
      }
    >
      <KnowledgeWorkspaceFrame
        context={
          <EnterpriseContextPanel
            focusType="knowledge"
            focusId={objectId}
            focusName={item.title}
          />
        }
      >
        <article
          className="space-y-4 rounded-lg border border-[var(--color-border)] p-4"
          data-testid="knowledge-managed-detail"
        >
          <p className="text-sm">{item.summary}</p>
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-medium">Owner</dt>
              <dd className="text-[var(--color-muted-foreground)]">{item.owner}</dd>
            </div>
            {item.decisionRef ? (
              <div>
                <dt className="font-medium">Decision reference</dt>
                <dd className="text-[var(--color-muted-foreground)]">
                  {item.decisionRef}
                </dd>
              </div>
            ) : null}
            {item.reviewDate ? (
              <div>
                <dt className="font-medium">Review date</dt>
                <dd className="text-[var(--color-muted-foreground)]">
                  {item.reviewDate}
                </dd>
              </div>
            ) : null}
            {bodyEntries.map(([key, value]) => (
              <div key={key}>
                <dt className="font-medium capitalize">{key.replaceAll("_", " ")}</dt>
                <dd className="text-[var(--color-muted-foreground)]">
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </dd>
              </div>
            ))}
          </dl>

          <section data-testid="knowledge-version-history">
            <h2 className="mb-2 text-sm font-semibold">Version history</h2>
            <ul className="space-y-1 text-xs text-[var(--color-muted-foreground)]">
              {item.versionHistory.map((entry) => (
                <li key={`${entry.version}-${entry.at}`}>
                  v{entry.version} · {entry.status}
                  {entry.note ? ` — ${entry.note}` : ""}
                </li>
              ))}
            </ul>
          </section>

          {canManage ? (
            <div
              className="flex flex-wrap gap-2"
              data-testid="knowledge-lifecycle-actions"
            >
              {LIFECYCLE.filter((status) => status !== item.status).map((status) => (
                <Button
                  key={status}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={lifecycleMutation.isPending}
                  onClick={() => lifecycleMutation.mutate(status)}
                  data-testid={`knowledge-lifecycle-${status}`}
                >
                  Move to {status}
                </Button>
              ))}
            </div>
          ) : null}

          <p className="text-xs text-[var(--color-muted-foreground)]">
            Knowledge owns organisational memory only. It never owns operational truth.
            Quality checks are rule-based — see{" "}
            <button
              type="button"
              className="underline"
              onClick={() => router.push(knowledgeQualityPath())}
            >
              Knowledge quality
            </button>
            .
          </p>
        </article>
      </KnowledgeWorkspaceFrame>
    </PageShell>
  );
}
