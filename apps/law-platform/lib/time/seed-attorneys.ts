/** Default billing rates for seed attorneys — display only in LAW-006-01. */
export interface SeedTimeAttorney {
  readonly userId: string;
  readonly displayName: string;
  readonly defaultRate: number;
}

export const SEED_TIME_ATTORNEYS: readonly SeedTimeAttorney[] = [
  {
    userId: "a1000001-0001-4000-8000-000000000001",
    displayName: "Sarah Mitchell",
    defaultRate: 450,
  },
  {
    userId: "a1000001-0001-4000-8000-000000000002",
    displayName: "James Okafor",
    defaultRate: 375,
  },
  {
    userId: "a1000001-0001-4000-8000-000000000003",
    displayName: "Emily Chen",
    defaultRate: 325,
  },
  {
    userId: "a1000001-0001-4000-8000-000000000004",
    displayName: "Marcus Reid",
    defaultRate: 325,
  },
  {
    userId: "a1000001-0001-4000-8000-000000000005",
    displayName: "Priya Sharma",
    defaultRate: 295,
  },
  {
    userId: "user-legal-workbench",
    displayName: "Legal Workbench User",
    defaultRate: 250,
  },
];

export function getAttorneyDisplayName(userId: string): string {
  return (
    SEED_TIME_ATTORNEYS.find((attorney) => attorney.userId === userId)?.displayName ??
    userId
  );
}

export function getAttorneyDefaultRate(userId: string): number {
  return (
    SEED_TIME_ATTORNEYS.find((attorney) => attorney.userId === userId)?.defaultRate ?? 0
  );
}
