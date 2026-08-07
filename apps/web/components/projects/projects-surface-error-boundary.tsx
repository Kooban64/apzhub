"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { applyProjectsDocumentTitle } from "@/lib/projects/document-title";

import { ErrorState, PageShell } from "./projects-ui";

type Props = {
  readonly children: ReactNode;
};

type State = {
  readonly error: Error | null;
};

/**
 * Ensures Projects surfaces always expose a titled PageShell when a view throws
 * (e.g. incomplete API payload). Blank document titles are release-blocking.
 */
export class ProjectsSurfaceErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    applyProjectsDocumentTitle("Something went wrong");
    if (process.env.NODE_ENV !== "production") {
      console.error("Projects surface error", error, info.componentStack);
    }
  }

  override componentDidUpdate(_prev: Props, prevState: State): void {
    if (this.state.error && this.state.error !== prevState.error) {
      applyProjectsDocumentTitle("Something went wrong");
    }
  }

  override render(): ReactNode {
    if (this.state.error) {
      applyProjectsDocumentTitle("Something went wrong");
      return (
        <PageShell
          title="Something went wrong"
          documentTitle="Something went wrong"
          breadcrumbs={["APZ Projects", "Error"]}
          description="This APZ Projects surface could not be displayed."
          enableProductivityChrome={false}
        >
          <ErrorState
            message={
              this.state.error.message?.trim()
                ? this.state.error.message
                : "An unexpected error occurred while loading APZ Projects."
            }
            onRetry={() => this.setState({ error: null })}
          />
        </PageShell>
      );
    }
    return this.props.children;
  }
}
