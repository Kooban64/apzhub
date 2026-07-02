import type {
  ActionToolbarItemDto,
  ActionToolbarRegionDto,
} from "../server/map-action-registry-dto";

/** Default sort order for toolbar items per ADR-0025. */
export const DEFAULT_TOOLBAR_ITEM_ORDER = 100;

/** Find a toolbar region by id. */
export function findToolbarRegion(
  regions: readonly ActionToolbarRegionDto[],
  region: string,
): ActionToolbarRegionDto | undefined {
  return regions.find((entry) => entry.region === region);
}

/** Sort toolbar items by `order` ascending (default 100). */
export function sortToolbarItems(
  items: readonly ActionToolbarItemDto[],
): readonly ActionToolbarItemDto[] {
  return Object.freeze(
    [...items].sort(
      (left, right) =>
        (left.order ?? DEFAULT_TOOLBAR_ITEM_ORDER) -
        (right.order ?? DEFAULT_TOOLBAR_ITEM_ORDER),
    ),
  );
}

/** Return sorted toolbar items for a region — empty when region is missing. */
export function filterToolbarRegionItems(
  regions: readonly ActionToolbarRegionDto[],
  region: string,
): readonly ActionToolbarItemDto[] {
  const match = findToolbarRegion(regions, region);

  if (!match) {
    return Object.freeze([]);
  }

  return sortToolbarItems(match.items);
}
