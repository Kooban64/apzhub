/** Seed attorneys for Matter Management UX validation (LAW-003-01). */
export interface SeedAttorney {
  readonly attorneyId: string;
  readonly displayName: string;
  readonly practiceAreaId: string;
}

export const SEED_ATTORNEYS: readonly SeedAttorney[] = [
  {
    attorneyId: "a1000001-0001-4000-8000-000000000001",
    displayName: "Sarah Mitchell",
    practiceAreaId: "litigation",
  },
  {
    attorneyId: "a1000001-0001-4000-8000-000000000002",
    displayName: "James Okafor",
    practiceAreaId: "corporate",
  },
  {
    attorneyId: "a1000001-0001-4000-8000-000000000003",
    displayName: "Emily Chen",
    practiceAreaId: "family",
  },
  {
    attorneyId: "a1000001-0001-4000-8000-000000000004",
    displayName: "Marcus Reid",
    practiceAreaId: "property",
  },
  {
    attorneyId: "a1000001-0001-4000-8000-000000000005",
    displayName: "Priya Sharma",
    practiceAreaId: "employment",
  },
];

export function getAttorneyDisplayName(attorneyId: string): string {
  return (
    SEED_ATTORNEYS.find((attorney) => attorney.attorneyId === attorneyId)
      ?.displayName ?? attorneyId
  );
}
