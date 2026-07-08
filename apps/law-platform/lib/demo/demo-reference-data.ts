/** Reference organisations for demo presentations (LAW-013-12). */
export const DEMO_ORGANISATIONS = [
  "Harbourview Holdings Pty Ltd",
  "Northbridge Mining Co-operative",
  "Summit Capital Partners",
  "Riverside Community Health Trust",
  "Federal Court of Australia",
  "Supreme Court of New South Wales",
  "District Court of Victoria",
] as const;

/** Reference courts for calendar and matter demo data (LAW-013-12). */
export const DEMO_COURTS = [
  { id: "court-fca", name: "Federal Court of Australia", jurisdiction: "Commonwealth" },
  { id: "court-nsw-sc", name: "Supreme Court of NSW", jurisdiction: "NSW" },
  { id: "court-vic-dc", name: "District Court of Victoria", jurisdiction: "VIC" },
  { id: "court-qld-mag", name: "Magistrates Court of Queensland", jurisdiction: "QLD" },
] as const;
