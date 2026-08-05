import type { WorkLifecycleState } from "@apzhub/platform-service-contracts";

/** Map product-native status strings to shared lifecycle projection. */
export function projectLifecycle(
  product: "projects" | "support" | "time" | "qep" | "workflow",
  nativeStatus: string | undefined,
): WorkLifecycleState {
  const status = (nativeStatus ?? "").toLowerCase();

  if (product === "projects") {
    if (status === "done") return "done";
    if (status === "cancelled") return "closed";
    if (status === "blocked") return "blocked";
    if (status === "in_progress") return "active";
    if (status === "open") return "ready";
    return "identified";
  }

  if (product === "support") {
    if (status === "closed" || status === "merged") return "closed";
    if (status === "pending") return "waiting";
    if (status === "open") return "active";
    if (status === "new") return "ready";
    return "identified";
  }

  if (product === "time") {
    if (status === "running") return "active";
    if (status === "stopped") return "done";
    if (status === "archived") return "closed";
    return "identified";
  }

  if (product === "qep") {
    if (
      status === "accepted" ||
      status === "completed" ||
      status === "done" ||
      status === "closed"
    ) {
      return "done";
    }
    if (status === "submitted_for_review" || status.includes("review")) {
      return "in_review";
    }
    if (status === "blocked") return "blocked";
    if (status === "in_progress" || status === "running" || status === "executing") {
      return "active";
    }
    if (status === "assigned" || status === "ready") return "ready";
    return "identified";
  }

  // workflow
  if (status === "completed" || status === "done" || status === "approved") {
    return "done";
  }
  if (status === "rejected" || status === "cancelled") return "closed";
  if (status === "waiting" || status === "pending") return "waiting";
  if (status === "in_progress" || status === "claimed") return "active";
  if (status === "open" || status === "ready") return "ready";
  return "identified";
}

export function isSameUtcDay(iso: string | undefined, now: Date): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}

export function isRecentlyCompleted(
  updatedAt: string | undefined,
  now: Date,
  windowMs = 7 * 24 * 60 * 60 * 1000,
): boolean {
  if (!updatedAt) return false;
  const t = new Date(updatedAt).getTime();
  if (Number.isNaN(t)) return false;
  return now.getTime() - t <= windowMs && now.getTime() - t >= 0;
}
