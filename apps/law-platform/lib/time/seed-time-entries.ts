import type { ManagedTimeEntry } from "./time-entry-types";
import { SEED_DOCUMENTS } from "../documents/seed-documents";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_TASKS } from "../tasks/seed-tasks";
import { getAttorneyDefaultRate, SEED_TIME_ATTORNEYS } from "./seed-attorneys";

function matter(index: number) {
  return SEED_MATTERS[index % SEED_MATTERS.length]!;
}

function task(index: number) {
  return SEED_TASKS[index % SEED_TASKS.length]!;
}

function document(index: number) {
  return SEED_DOCUMENTS[index % SEED_DOCUMENTS.length]!;
}

function attorney(index: number) {
  return SEED_TIME_ATTORNEYS[index % SEED_TIME_ATTORNEYS.length]!;
}

function isoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function isoDateTime(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function amount(durationMinutes: number, rate: number, billable: boolean): number {
  if (!billable) {
    return 0;
  }

  return Math.round((durationMinutes / 60) * rate * 100) / 100;
}

interface SeedConfig {
  readonly index: number;
  readonly daysAgo: number;
  readonly matterIndex: number;
  readonly attorneyIndex: number;
  readonly durationMinutes: number;
  readonly narrative: string;
  readonly billable?: boolean;
  readonly taskIndex?: number;
  readonly documentIndex?: number;
  readonly startHour?: number;
  readonly activityCode?: string;
}

const SEED_CONFIGS: readonly SeedConfig[] = [
  {
    index: 1,
    daysAgo: 1,
    matterIndex: 0,
    attorneyIndex: 0,
    durationMinutes: 90,
    narrative: "Client conference re Harbourview zoning appeal strategy",
    taskIndex: 0,
    startHour: 9,
  },
  {
    index: 2,
    daysAgo: 1,
    matterIndex: 0,
    attorneyIndex: 1,
    durationMinutes: 120,
    narrative: "Draft statement of claim revisions",
    taskIndex: 0,
    documentIndex: 0,
    startHour: 13,
  },
  {
    index: 3,
    daysAgo: 2,
    matterIndex: 1,
    attorneyIndex: 2,
    durationMinutes: 45,
    narrative: "Review opposing counsel correspondence",
    billable: true,
    startHour: 10,
  },
  {
    index: 4,
    daysAgo: 2,
    matterIndex: 1,
    attorneyIndex: 3,
    durationMinutes: 60,
    narrative: "Prepare witness interview outline",
    taskIndex: 2,
    startHour: 14,
  },
  {
    index: 5,
    daysAgo: 3,
    matterIndex: 2,
    attorneyIndex: 4,
    durationMinutes: 30,
    narrative: "Internal case strategy meeting",
    billable: false,
    startHour: 11,
  },
  {
    index: 6,
    daysAgo: 3,
    matterIndex: 2,
    attorneyIndex: 0,
    durationMinutes: 75,
    narrative: "Legal research on contract interpretation",
    documentIndex: 2,
    startHour: 15,
  },
  {
    index: 7,
    daysAgo: 4,
    matterIndex: 3,
    attorneyIndex: 1,
    durationMinutes: 50,
    narrative: "Draft motion for summary judgment",
    taskIndex: 4,
    startHour: 9,
  },
  {
    index: 8,
    daysAgo: 4,
    matterIndex: 3,
    attorneyIndex: 2,
    durationMinutes: 40,
    narrative: "Telephone conference with client",
    startHour: 16,
  },
  {
    index: 9,
    daysAgo: 5,
    matterIndex: 4,
    attorneyIndex: 3,
    durationMinutes: 105,
    narrative: "Document review for discovery production",
    taskIndex: 5,
    documentIndex: 5,
    startHour: 10,
  },
  {
    index: 10,
    daysAgo: 5,
    matterIndex: 4,
    attorneyIndex: 4,
    durationMinutes: 25,
    narrative: "File management and matter admin",
    billable: false,
    startHour: 17,
  },
  {
    index: 11,
    daysAgo: 6,
    matterIndex: 0,
    attorneyIndex: 5,
    durationMinutes: 65,
    narrative: "Prepare affidavit in support of injunction",
    taskIndex: 1,
    documentIndex: 1,
    startHour: 9,
  },
  {
    index: 12,
    daysAgo: 6,
    matterIndex: 1,
    attorneyIndex: 0,
    durationMinutes: 55,
    narrative: "Review expert report and draft questions",
    documentIndex: 3,
    startHour: 13,
  },
  {
    index: 13,
    daysAgo: 7,
    matterIndex: 2,
    attorneyIndex: 1,
    durationMinutes: 80,
    narrative: "Deposition preparation with client",
    taskIndex: 6,
    startHour: 10,
  },
  {
    index: 14,
    daysAgo: 7,
    matterIndex: 3,
    attorneyIndex: 2,
    durationMinutes: 35,
    narrative: "Court filing coordination",
    startHour: 15,
  },
  {
    index: 15,
    daysAgo: 8,
    matterIndex: 4,
    attorneyIndex: 3,
    durationMinutes: 95,
    narrative: "Draft settlement term sheet",
    taskIndex: 7,
    startHour: 9,
  },
  {
    index: 16,
    daysAgo: 8,
    matterIndex: 0,
    attorneyIndex: 4,
    durationMinutes: 20,
    narrative: "Team stand-up and matter status update",
    billable: false,
    startHour: 8,
  },
  {
    index: 17,
    daysAgo: 9,
    matterIndex: 1,
    attorneyIndex: 5,
    durationMinutes: 70,
    narrative: "Analyze precedent for damages calculation",
    documentIndex: 4,
    startHour: 11,
  },
  {
    index: 18,
    daysAgo: 9,
    matterIndex: 2,
    attorneyIndex: 0,
    durationMinutes: 45,
    narrative: "Client email correspondence and follow-up",
    startHour: 14,
  },
  {
    index: 19,
    daysAgo: 10,
    matterIndex: 3,
    attorneyIndex: 1,
    durationMinutes: 110,
    narrative: "Draft response to interrogatories",
    taskIndex: 8,
    documentIndex: 6,
    startHour: 9,
  },
  {
    index: 20,
    daysAgo: 10,
    matterIndex: 4,
    attorneyIndex: 2,
    durationMinutes: 60,
    narrative: "Mediation preparation session",
    taskIndex: 9,
    startHour: 13,
  },
  {
    index: 21,
    daysAgo: 11,
    matterIndex: 0,
    attorneyIndex: 3,
    durationMinutes: 85,
    narrative: "Review zoning board decision records",
    documentIndex: 7,
    startHour: 10,
  },
  {
    index: 22,
    daysAgo: 11,
    matterIndex: 1,
    attorneyIndex: 4,
    durationMinutes: 50,
    narrative: "Draft notice of motion",
    taskIndex: 10,
    startHour: 15,
  },
  {
    index: 23,
    daysAgo: 12,
    matterIndex: 2,
    attorneyIndex: 5,
    durationMinutes: 40,
    narrative: "CLE research unrelated to billable work",
    billable: false,
    startHour: 12,
  },
  {
    index: 24,
    daysAgo: 12,
    matterIndex: 3,
    attorneyIndex: 0,
    durationMinutes: 75,
    narrative: "Client intake and conflict check follow-up",
    startHour: 9,
  },
  {
    index: 25,
    daysAgo: 13,
    matterIndex: 4,
    attorneyIndex: 1,
    durationMinutes: 100,
    narrative: "Prepare chronology for trial binder",
    taskIndex: 11,
    documentIndex: 8,
    startHour: 10,
  },
  {
    index: 26,
    daysAgo: 13,
    matterIndex: 0,
    attorneyIndex: 2,
    durationMinutes: 55,
    narrative: "Conference with co-counsel on appeal grounds",
    startHour: 14,
  },
  {
    index: 27,
    daysAgo: 14,
    matterIndex: 1,
    attorneyIndex: 3,
    durationMinutes: 65,
    narrative: "Draft protective order proposal",
    taskIndex: 12,
    startHour: 9,
  },
  {
    index: 28,
    daysAgo: 14,
    matterIndex: 2,
    attorneyIndex: 4,
    durationMinutes: 30,
    narrative: "Travel to client site for document collection",
    billable: true,
    startHour: 8,
  },
  {
    index: 29,
    daysAgo: 15,
    matterIndex: 3,
    attorneyIndex: 5,
    durationMinutes: 90,
    narrative: "Review production set for privilege",
    documentIndex: 9,
    startHour: 11,
  },
  {
    index: 30,
    daysAgo: 15,
    matterIndex: 4,
    attorneyIndex: 0,
    durationMinutes: 45,
    narrative: "Billing review and time narrative cleanup",
    billable: false,
    startHour: 17,
  },
  {
    index: 31,
    daysAgo: 16,
    matterIndex: 0,
    attorneyIndex: 1,
    durationMinutes: 120,
    narrative: "Draft appellate factum outline",
    taskIndex: 13,
    documentIndex: 10,
    startHour: 9,
  },
  {
    index: 32,
    daysAgo: 16,
    matterIndex: 1,
    attorneyIndex: 2,
    durationMinutes: 35,
    narrative: "Quick client status call",
    startHour: 16,
  },
  {
    index: 33,
    daysAgo: 17,
    matterIndex: 2,
    attorneyIndex: 3,
    durationMinutes: 80,
    narrative: "Legal memo on limitation period issues",
    documentIndex: 11,
    startHour: 10,
  },
  {
    index: 34,
    daysAgo: 17,
    matterIndex: 3,
    attorneyIndex: 4,
    durationMinutes: 60,
    narrative: "Prepare examination for discovery questions",
    taskIndex: 14,
    startHour: 13,
  },
  {
    index: 35,
    daysAgo: 18,
    matterIndex: 4,
    attorneyIndex: 5,
    durationMinutes: 25,
    narrative: "Administrative filing with court registry",
    startHour: 15,
  },
  {
    index: 36,
    daysAgo: 18,
    matterIndex: 0,
    attorneyIndex: 0,
    durationMinutes: 95,
    narrative: "Review environmental impact assessment",
    documentIndex: 12,
    startHour: 9,
  },
  {
    index: 37,
    daysAgo: 19,
    matterIndex: 1,
    attorneyIndex: 1,
    durationMinutes: 70,
    narrative: "Draft retainer amendment letter",
    taskIndex: 15,
    startHour: 11,
  },
  {
    index: 38,
    daysAgo: 19,
    matterIndex: 2,
    attorneyIndex: 2,
    durationMinutes: 50,
    narrative: "Negotiation call with opposing counsel",
    startHour: 14,
  },
  {
    index: 39,
    daysAgo: 20,
    matterIndex: 3,
    attorneyIndex: 3,
    durationMinutes: 85,
    narrative: "Compile exhibit list for hearing",
    taskIndex: 16,
    documentIndex: 13,
    startHour: 10,
  },
  {
    index: 40,
    daysAgo: 20,
    matterIndex: 4,
    attorneyIndex: 4,
    durationMinutes: 40,
    narrative: "Matter closing checklist review",
    billable: false,
    startHour: 16,
  },
  {
    index: 41,
    daysAgo: 21,
    matterIndex: 0,
    attorneyIndex: 5,
    durationMinutes: 105,
    narrative: "Draft reply submissions for zoning board",
    taskIndex: 17,
    documentIndex: 14,
    startHour: 9,
  },
  {
    index: 42,
    daysAgo: 22,
    matterIndex: 1,
    attorneyIndex: 0,
    durationMinutes: 55,
    narrative: "Client training on document retention policy",
    documentIndex: 15,
    startHour: 13,
  },
];

function buildSeedEntry(config: SeedConfig): ManagedTimeEntry {
  const selectedMatter = matter(config.matterIndex);
  const selectedAttorney = attorney(config.attorneyIndex);
  const selectedTask =
    config.taskIndex !== undefined ? task(config.taskIndex) : undefined;
  const selectedDocument =
    config.documentIndex !== undefined ? document(config.documentIndex) : undefined;
  const billable = config.billable ?? true;
  const rate = getAttorneyDefaultRate(selectedAttorney.userId);
  const entryDate = isoDate(config.daysAgo);
  const startHour = config.startHour ?? 9;
  const startTime = isoDateTime(config.daysAgo, startHour, 0);
  const endTime = isoDateTime(config.daysAgo, startHour, config.durationMinutes);

  return {
    timeEntryId: `te1000001-0001-4000-8000-${String(config.index).padStart(12, "0")}`,
    timeEntryReference: `TIM-2026-${String(config.index).padStart(6, "0")}`,
    matterId: selectedMatter.matterId,
    userId: selectedAttorney.userId,
    entryDate,
    durationMinutes: config.durationMinutes,
    narrative: config.narrative,
    activityCode: config.activityCode ?? "LIT",
    billable,
    billingStatus: "unbilled",
    rate,
    amount: amount(config.durationMinutes, rate, billable),
    taskId: selectedTask?.taskId,
    documentId: selectedDocument?.documentId,
    startTime,
    endTime,
    createdAt: isoDateTime(config.daysAgo, startHour - 1, 0),
  };
}

/** Forty-two realistic seed time entries linked to matters (LAW-006-01). */
export const SEED_TIME_ENTRIES: readonly ManagedTimeEntry[] =
  SEED_CONFIGS.map(buildSeedEntry);
