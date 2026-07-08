/** Document categories for UX validation (LAW-004-01). */
export interface SeedDocumentCategory {
  readonly documentCategoryId: string;
  readonly categoryCode: string;
  readonly name: string;
}

export const SEED_DOCUMENT_CATEGORIES: readonly SeedDocumentCategory[] = [
  { documentCategoryId: "pleadings", categoryCode: "PLEAD", name: "Pleadings" },
  { documentCategoryId: "contracts", categoryCode: "CONTR", name: "Contracts" },
  {
    documentCategoryId: "correspondence",
    categoryCode: "CORR",
    name: "Correspondence",
  },
  { documentCategoryId: "evidence", categoryCode: "EVID", name: "Evidence" },
  { documentCategoryId: "research", categoryCode: "RES", name: "Research" },
  { documentCategoryId: "billing", categoryCode: "BILL", name: "Billing" },
];

export function getDocumentCategoryName(categoryId: string): string {
  return (
    SEED_DOCUMENT_CATEGORIES.find(
      (category) => category.documentCategoryId === categoryId,
    )?.name ?? categoryId
  );
}
