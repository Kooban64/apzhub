import type { ActionDescriptor } from "../types";
import type { ActionRegistry } from "../registry";

/** Serialisable toolbar item — AF-017 extraction. */
export interface ActionToolbarItemDto {
  readonly commandId: string;
  readonly icon?: string;
  readonly label?: string;
  readonly order?: number;
}

/** Serialisable toolbar region — AF-017. */
export interface ActionToolbarRegionDto {
  readonly region: string;
  readonly items: readonly ActionToolbarItemDto[];
}

/** Client-safe action registry payload — hydrated server-side. */
export interface ActionRegistryDto {
  readonly actions: readonly ActionDescriptor[];
  readonly toolbar: readonly ActionToolbarRegionDto[];
}

export function createEmptyActionRegistryDto(): ActionRegistryDto {
  return {
    actions: [],
    toolbar: [],
  };
}

/** Map in-memory registry snapshot to a serialisable DTO (pre-permission filter). */
export function mapActionRegistryDto(
  registry: ActionRegistry,
  toolbar: readonly ActionToolbarRegionDto[] = [],
): ActionRegistryDto {
  return {
    actions: registry.list(),
    toolbar,
  };
}
