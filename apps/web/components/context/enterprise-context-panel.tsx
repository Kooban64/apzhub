"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type {
  ContextFocusType,
  ContextFragment,
  ContextSlice,
  EnterpriseContextComposition,
} from "@apzhub/platform-service-contracts";

import { fetchEnterpriseContext, isContextApiError } from "@/lib/context/context-api";
import {
  recordContextLearningEvent,
  targetProductFromHref,
} from "@/lib/context/learning-telemetry";
import { contextQueryKeys } from "@/lib/context/query-keys";

import { ContextSection } from "./context-ui";

const SECTION_TITLES: Record<string, string> = {
  projects: "Projects",
  workflow: "Workflow",
  support: "Support",
  documents: "Documents",
  law: "Governance",
  knowledge: "Knowledge",
};

function absenceLabel(slice: ContextSlice, focusType: ContextFocusType): string {
  if (slice.absenceReason === "denied") {
    return "Access denied in the owning product.";
  }
  if (slice.absenceReason === "unavailable") {
    return "Temporarily unavailable from the owning product.";
  }
  return `No linked context for this ${focusType}.`;
}

function FragmentRow({
  fragment,
  sectionId,
}: {
  readonly fragment: ContextFragment;
  readonly sectionId: string;
}) {
  const content = (
    <>
      <p className="text-sm font-medium text-[var(--color-foreground)]">
        {fragment.title}
      </p>
      {fragment.summary ? (
        <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
          {fragment.summary}
        </p>
      ) : null}
      <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Source: {fragment.productLabel}
        {fragment.sourceEntityRef ? ` · ${fragment.sourceEntityRef}` : ""}
      </p>
    </>
  );

  if (fragment.href) {
    return (
      <li data-testid={`context-fragment-${fragment.id}`}>
        <Link
          href={fragment.href}
          className="block rounded-md border border-transparent px-1 py-1.5 hover:border-[var(--color-border)] hover:bg-[var(--color-background)]"
          onClick={() =>
            recordContextLearningEvent("context.link_followed", {
              sectionId,
              targetProduct: targetProductFromHref(fragment.href!),
              fragmentClass: fragment.fragmentClass,
            })
          }
        >
          {content}
        </Link>
      </li>
    );
  }

  return <li data-testid={`context-fragment-${fragment.id}`}>{content}</li>;
}

function SliceSection({
  slice,
  focusType,
  onViewed,
}: {
  readonly slice: ContextSlice;
  readonly focusType: ContextFocusType;
  readonly onViewed: (sectionId: string) => void;
}) {
  const title = SECTION_TITLES[slice.sectionId] ?? slice.productLabel;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      onViewed(slice.sectionId);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onViewed(slice.sectionId);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onViewed, slice.sectionId]);

  return (
    <ContextSection title={title}>
      <div ref={ref} data-testid={`context-slice-${slice.sectionId}`}>
        {slice.fragments.length === 0 ? (
          <p
            className="text-xs text-[var(--color-muted-foreground)]"
            data-testid={`context-slice-${slice.sectionId}-empty`}
          >
            {absenceLabel(slice, focusType)}
          </p>
        ) : (
          <ul className="space-y-2">
            {slice.fragments.map((fragment) => (
              <FragmentRow
                key={fragment.id}
                fragment={fragment}
                sectionId={slice.sectionId}
              />
            ))}
          </ul>
        )}
      </div>
    </ContextSection>
  );
}

export function EnterpriseContextPanel({
  focusType = "project",
  focusId,
  focusName,
  focusIdentifier,
  projectId,
  projectName,
  projectIdentifier,
}: {
  readonly focusType?: ContextFocusType;
  readonly focusId?: string;
  /** @deprecated Prefer focusId — retained for Projects CONTEXT-001 call sites. */
  readonly projectId?: string;
  readonly focusName?: string;
  readonly focusIdentifier?: string;
  /** @deprecated Prefer focusName */
  readonly projectName?: string;
  /** @deprecated Prefer focusIdentifier */
  readonly projectIdentifier?: string;
}) {
  const resolvedFocusId = focusId ?? projectId ?? "";
  const name = focusName ?? projectName;
  const identifier = focusIdentifier ?? projectIdentifier;
  const [collapsed, setCollapsed] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [comment, setComment] = useState("");
  const openedAtRef = useRef<number>(Date.now());
  const viewedSections = useRef(new Set<string>());
  const loadTimedRef = useRef(false);

  const query = useQuery({
    queryKey: contextQueryKeys.focus(focusType, resolvedFocusId),
    queryFn: ({ signal }) =>
      fetchEnterpriseContext({
        focusType,
        focusId: resolvedFocusId,
        focusName: name,
        focusIdentifier: identifier,
        projectName: name,
        projectIdentifier: identifier,
        signal,
      }),
    enabled: Boolean(resolvedFocusId),
  });

  const composition = query.data as EnterpriseContextComposition | undefined;

  useEffect(() => {
    openedAtRef.current = Date.now();
    loadTimedRef.current = false;
    viewedSections.current = new Set();
    recordContextLearningEvent("context.panel_opened", { focusType });
    return () => {
      recordContextLearningEvent("context.panel_collapsed", {
        focusType,
        visibleMs: Date.now() - openedAtRef.current,
      });
    };
  }, [resolvedFocusId, focusType]);

  useEffect(() => {
    if (!composition?.operational || loadTimedRef.current) return;
    loadTimedRef.current = true;
    const missingProviderCount = composition.operational.providers.filter(
      (provider) => provider.status === "unavailable" || provider.status === "denied",
    ).length;
    recordContextLearningEvent("context.load_timed", {
      focusType,
      totalMs: composition.operational.totalMs,
      missingProviderCount,
      providerStatuses: composition.operational.providers.map(
        (provider) => `${provider.providerId}:${provider.status}`,
      ),
    });
  }, [composition, focusType]);

  const onSectionViewed = (sectionId: string) => {
    if (viewedSections.current.has(sectionId)) return;
    viewedSections.current.add(sectionId);
    recordContextLearningEvent("context.section_viewed", {
      sectionId,
      focusType,
    });
  };

  const submitFeedback = (rating: "helpful" | "not_helpful") => {
    recordContextLearningEvent("context.feedback", {
      rating,
      focusType,
      ...(comment.trim() ? { comment: comment.trim().slice(0, 280) } : {}),
    });
    setFeedbackSent(true);
  };

  return (
    <div data-testid="enterprise-context-panel" className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Enterprise Context
          </p>
          <p
            className="mt-1 text-sm font-medium text-[var(--color-foreground)]"
            data-testid="enterprise-context-question"
          >
            What do I need to know before I continue?
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-testid="enterprise-context-collapse"
          onClick={() => {
            if (!collapsed) {
              recordContextLearningEvent("context.panel_collapsed", {
                focusType,
                visibleMs: Date.now() - openedAtRef.current,
              });
            } else {
              openedAtRef.current = Date.now();
              recordContextLearningEvent("context.panel_opened", { focusType });
            }
            setCollapsed((value) => !value);
          }}
        >
          {collapsed ? "Show" : "Hide"}
        </Button>
      </div>

      {collapsed ? null : (
        <>
          {query.isLoading ? (
            <p
              className="text-xs text-[var(--color-muted-foreground)]"
              data-testid="enterprise-context-loading"
            >
              Composing context…
            </p>
          ) : null}

          {query.isError ? (
            <p
              className="text-xs text-[var(--color-destructive)]"
              data-testid="enterprise-context-error"
            >
              {isContextApiError(query.error)
                ? query.error.message
                : "Unable to compose context."}
            </p>
          ) : null}

          {composition?.partial ? (
            <p
              className="text-xs text-[var(--color-muted-foreground)]"
              data-testid="enterprise-context-partial"
            >
              Some providers could not contribute. Showing available context only —
              Systems of Record are unchanged.
            </p>
          ) : null}

          {composition
            ? composition.slices.map((slice) => (
                <SliceSection
                  key={slice.sectionId}
                  slice={slice}
                  focusType={focusType}
                  onViewed={onSectionViewed}
                />
              ))
            : null}

          <div
            className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-3"
            data-testid="enterprise-context-feedback"
          >
            {feedbackSent ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Thanks — feedback recorded for Product Learning.
              </p>
            ) : (
              <>
                <p className="w-full text-xs text-[var(--color-muted-foreground)]">
                  Was this helpful?
                </p>
                <textarea
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent p-2 text-xs"
                  rows={2}
                  maxLength={280}
                  placeholder="Optional comment (no operational details needed)"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  data-testid="enterprise-context-feedback-comment"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid="enterprise-context-feedback-helpful"
                  onClick={() => submitFeedback("helpful")}
                >
                  Helpful
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid="enterprise-context-feedback-not-helpful"
                  onClick={() => submitFeedback("not_helpful")}
                >
                  Not helpful
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
