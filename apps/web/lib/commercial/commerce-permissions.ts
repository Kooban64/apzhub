/**
 * Commercial control-plane permissions — PermissionService keys only.
 * Do not introduce a second AuthZ engine.
 */

export const COMMERCE_CATALOGUE_READ = "commerce.catalogue.read";
export const COMMERCE_CATALOGUE_MANAGE = "commerce.catalogue.manage";
export const COMMERCE_PRICING_READ = "commerce.pricing.read";
export const COMMERCE_PRICING_MANAGE = "commerce.pricing.manage";
export const COMMERCE_DISCOUNT_READ = "commerce.discount.read";
export const COMMERCE_DISCOUNT_MANAGE = "commerce.discount.manage";
export const COMMERCE_TAX_READ = "commerce.tax.read";
export const COMMERCE_TAX_MANAGE = "commerce.tax.manage";

export const COMMERCE_PERMISSIONS = [
  COMMERCE_CATALOGUE_READ,
  COMMERCE_CATALOGUE_MANAGE,
  COMMERCE_PRICING_READ,
  COMMERCE_PRICING_MANAGE,
  COMMERCE_DISCOUNT_READ,
  COMMERCE_DISCOUNT_MANAGE,
  COMMERCE_TAX_READ,
  COMMERCE_TAX_MANAGE,
] as const;

export const COMMERCE_READ_PERMISSIONS = [
  COMMERCE_CATALOGUE_READ,
  COMMERCE_PRICING_READ,
  COMMERCE_DISCOUNT_READ,
  COMMERCE_TAX_READ,
] as const;

export const COMMERCE_MANAGE_PERMISSIONS = [
  COMMERCE_CATALOGUE_MANAGE,
  COMMERCE_PRICING_MANAGE,
  COMMERCE_DISCOUNT_MANAGE,
  COMMERCE_TAX_MANAGE,
] as const;

export type CommercePermission = (typeof COMMERCE_PERMISSIONS)[number];

export function isCommerceManagePermission(key: string): boolean {
  return (COMMERCE_MANAGE_PERMISSIONS as readonly string[]).includes(key);
}

export function hasGrantedPermission(
  granted: readonly string[],
  required: string,
): boolean {
  if (granted.includes("*") || granted.includes(required)) return true;
  const parts = required.split(".");
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    if (granted.includes(`${parts.slice(0, i).join(".")}.*`)) return true;
  }
  return false;
}

export function canReadCommercePricing(granted: readonly string[]): boolean {
  return (
    hasGrantedPermission(granted, COMMERCE_PRICING_READ) ||
    hasGrantedPermission(granted, COMMERCE_PRICING_MANAGE) ||
    hasGrantedPermission(granted, "catalogue.read") ||
    hasGrantedPermission(granted, "catalogue.manage")
  );
}

export function canManageCommercePricing(granted: readonly string[]): boolean {
  return hasGrantedPermission(granted, COMMERCE_PRICING_MANAGE);
}

export function canManageCommerceDiscounts(granted: readonly string[]): boolean {
  return hasGrantedPermission(granted, COMMERCE_DISCOUNT_MANAGE);
}

export function canManageCommerceTax(granted: readonly string[]): boolean {
  return hasGrantedPermission(granted, COMMERCE_TAX_MANAGE);
}

export function canManageCommerceCatalogue(granted: readonly string[]): boolean {
  return hasGrantedPermission(granted, COMMERCE_CATALOGUE_MANAGE);
}
