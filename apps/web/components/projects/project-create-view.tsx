"use client";

import { Suspense } from "react";

import { ProjectInitiateWizard } from "./project-initiate-wizard";
import { LoadingState } from "./projects-ui";

/** Replaces legacy create-project form with W003 eight-stage Initiate wizard. */
export function ProjectCreateView() {
  return (
    <Suspense fallback={<LoadingState label="Loading initiate wizard…" />}>
      <ProjectInitiateWizard />
    </Suspense>
  );
}
