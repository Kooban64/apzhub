import type { WorkbenchPermissionAdapter } from "./interfaces/permission-adapter";
import type {
  NavigationContribution,
  NavigationItem,
  ViewDescriptor,
} from "./interfaces/types";
import type { AuthSessionPermissionInput } from "./permission/auth-permission-adapter";

/** Client-safe registry snapshot for workbench hydration (server boundary). */

export interface WorkbenchNavItemDto {
  id: string;
  capabilityId?: string;
  capabilityKind?: string;
  level: "activity-bar" | "sidebar" | "workspace" | "context";
  workspace: string;
  label: string;
  icon?: string;
  route?: string;
  order: number;
  parent?: string;
  permission?: string;
  hidden?: boolean;
  badge?: string;
}

export interface WorkbenchViewDescriptorDto {
  viewId: string;
  capabilityId?: string;
  capabilityKind?: string;
  title: string;
  workspace: string;
  route?: string;
  icon?: string;
  permission?: string;
  default?: boolean;
}

export interface WorkbenchRegistryDto {
  schemaVersion: "1.0";
  navItems: readonly WorkbenchNavItemDto[];
  views: readonly WorkbenchViewDescriptorDto[];
}

export function createEmptyWorkbenchRegistryDto(): WorkbenchRegistryDto {
  return {
    schemaVersion: "1.0",
    navItems: [],
    views: [],
  };
}

export function mapContributionsToRegistryDto(
  contributions: readonly NavigationContribution[],
  views: readonly ViewDescriptor[] = [],
): WorkbenchRegistryDto {
  return mapWorkbenchRegistryDto(contributions, views);
}

export function mapNavigationItemsToRegistryDto(
  items: readonly NavigationItem[],
  views: readonly ViewDescriptor[] = [],
): WorkbenchRegistryDto {
  return {
    schemaVersion: "1.0",
    navItems: items.map((item) => mapContributionToNavDto(item)),
    views: views.map(mapViewDescriptorToDto),
  };
}

export function mapWorkbenchRegistryDto(
  contributions: readonly NavigationContribution[],
  views: readonly ViewDescriptor[],
): WorkbenchRegistryDto {
  return {
    schemaVersion: "1.0",
    navItems: contributions.map(mapContributionToNavDto),
    views: views.map(mapViewDescriptorToDto),
  };
}

export function mapRegistryDtoToContributions(
  dto: WorkbenchRegistryDto,
): NavigationContribution[] {
  return dto.navItems.map((item) => ({
    id: item.id,
    capabilityId: item.capabilityId ?? item.id,
    capabilityKind: item.capabilityKind ?? "module",
    level: item.level,
    workspace: item.workspace,
    label: item.label,
    icon: item.icon,
    route: item.route,
    order: item.order,
    parent: item.parent,
    permission: item.permission,
    hidden: item.hidden ?? false,
    badge: item.badge,
  }));
}

export function mapRegistryDtoToViewDescriptors(
  dto: WorkbenchRegistryDto,
): ViewDescriptor[] {
  return dto.views.map((item) => ({
    viewId: item.viewId,
    capabilityId: item.capabilityId ?? item.viewId,
    capabilityKind: item.capabilityKind ?? "module",
    title: item.title,
    workspace: item.workspace,
    route: item.route,
    permission: item.permission,
    default: item.default ?? false,
    icon: item.icon,
  }));
}

function mapContributionToNavDto(
  contribution: NavigationContribution,
): WorkbenchNavItemDto {
  return {
    id: contribution.id,
    capabilityId: contribution.capabilityId,
    capabilityKind: contribution.capabilityKind,
    level: contribution.level,
    workspace: contribution.workspace,
    label: contribution.label,
    icon: contribution.icon,
    route: contribution.route,
    order: contribution.order,
    parent: contribution.parent,
    permission: contribution.permission,
    hidden: contribution.hidden,
    badge: contribution.badge,
  };
}

function mapViewDescriptorToDto(
  descriptor: ViewDescriptor,
): WorkbenchViewDescriptorDto {
  return {
    viewId: descriptor.viewId,
    capabilityId: descriptor.capabilityId,
    capabilityKind: descriptor.capabilityKind,
    title: descriptor.title,
    workspace: descriptor.workspace,
    route: descriptor.route,
    icon: descriptor.icon,
    permission: descriptor.permission,
    default: descriptor.default,
  };
}

export function mapViewDescriptorsToDto(
  descriptors: readonly ViewDescriptor[],
): WorkbenchViewDescriptorDto[] {
  return descriptors.map(mapViewDescriptorToDto);
}

/** Server-side registry filter — hide items the user cannot access (ADR-0023). */
export function filterWorkbenchRegistryDto(
  dto: WorkbenchRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): WorkbenchRegistryDto {
  return {
    schemaVersion: dto.schemaVersion,
    navItems: permissionAdapter.filter([...dto.navItems]),
    views: permissionAdapter.filter([...dto.views]),
  };
}

export function createAuthPermissionContextFromUser(
  user: { id: string } | null | undefined,
  options?: { roles?: readonly string[]; permissions?: readonly string[] },
): AuthSessionPermissionInput | null {
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    roles: options?.roles ?? [],
    permissions: options?.permissions ?? [],
  };
}
