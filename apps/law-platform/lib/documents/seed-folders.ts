import type { Folder } from "@apzhub/legal-business-core";

import { SEED_MATTERS } from "../matters/seed-matters";

/** Folders linked to seeded matters for Document Management UX (LAW-004-01). */
export const SEED_FOLDERS: readonly Folder[] = [
  {
    folderId: "f1000001-0001-4000-8000-000000000001",
    name: "Pleadings",
    matterId: SEED_MATTERS[0]!.matterId,
    sortOrder: 1,
  },
  {
    folderId: "f1000001-0001-4000-8000-000000000002",
    name: "Correspondence",
    matterId: SEED_MATTERS[0]!.matterId,
    sortOrder: 2,
  },
  {
    folderId: "f1000001-0001-4000-8000-000000000003",
    name: "Contracts",
    matterId: SEED_MATTERS[4]!.matterId,
    sortOrder: 1,
  },
  {
    folderId: "f1000001-0001-4000-8000-000000000004",
    name: "Evidence",
    matterId: SEED_MATTERS[8]!.matterId,
    sortOrder: 1,
  },
  {
    folderId: "f1000001-0001-4000-8000-000000000005",
    name: "Research",
    matterId: SEED_MATTERS[1]!.matterId,
    sortOrder: 1,
  },
  {
    folderId: "f1000001-0001-4000-8000-000000000006",
    name: "Billing",
    matterId: SEED_MATTERS[4]!.matterId,
    sortOrder: 2,
  },
];

export function getFolderName(folderId: string): string {
  return SEED_FOLDERS.find((folder) => folder.folderId === folderId)?.name ?? folderId;
}

export function listFoldersForMatter(matterId: string): readonly Folder[] {
  return SEED_FOLDERS.filter((folder) => folder.matterId === matterId);
}
