import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { getDocumentCategoryName, SEED_DOCUMENT_CATEGORIES } from "./seed-categories";
import { getFolderName, listFoldersForMatter, SEED_FOLDERS } from "./seed-folders";

export function getMatterTitleForDocument(matterId: string): string {
  return getSharedMatterRepository().getById(matterId)?.title ?? matterId;
}

export function getDocumentCategoryLabel(categoryId: string): string {
  return getDocumentCategoryName(categoryId);
}

export function getDocumentFolderLabel(folderId?: string): string {
  if (!folderId) {
    return "—";
  }

  return getFolderName(folderId);
}

export { SEED_DOCUMENT_CATEGORIES, SEED_FOLDERS, listFoldersForMatter };
