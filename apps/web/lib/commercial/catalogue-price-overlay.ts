/**
 * Catalogue price overlay — compatibility facade over the commercial control plane.
 */

export {
  getCataloguePriceOverlay,
  resetCataloguePriceOverlayForTests,
  setPackageListPrice,
  setProductListPrice,
  type CataloguePriceOverlay,
} from "@/lib/commercial/commercial-config";

import {
  getProduct,
  listPackages,
  listProducts,
  type PackageCatalogueEntry,
  type PackageId,
  type ProductKey,
} from "@/lib/commercial/catalogue";
import {
  getOrInitItem,
  hydrateCommercialConfig,
  legacyPackageAmount,
  legacyProductAmount,
} from "@/lib/commercial/commercial-config";
import { resolveListPrice } from "@/lib/commercial/pricing-engine";

export function resolvedPackageAmountCents(pkg: PackageCatalogueEntry): number | null {
  hydrateCommercialConfig();
  const resolved = resolveListPrice({
    packageId: pkg.packageId,
    regionId: "SOUTH_AFRICA",
    layer: "published",
  });
  if (resolved.amountCents != null) return resolved.amountCents;
  return pkg.amountCents;
}

export function resolvedProductAmountCents(productKey: ProductKey): number | null {
  hydrateCommercialConfig();
  const overlayAmount = legacyProductAmount(productKey);
  if (typeof overlayAmount === "number") return overlayAmount;
  return getProduct(productKey)?.amountCents ?? null;
}

export function listResolvedPackagePrices(): readonly {
  readonly packageId: PackageId | string;
  readonly name: string;
  readonly status: string;
  readonly selfServe: boolean;
  readonly amountCents: number | null;
  readonly currency: string;
  readonly source: "catalogue" | "admin" | "unset";
  readonly pricingUnit: string;
}[] {
  hydrateCommercialConfig();
  return listPackages({ activeOnly: false }).map((pkg) => {
    const resolved = resolveListPrice({
      packageId: pkg.packageId,
      regionId: "SOUTH_AFRICA",
      layer: "published",
    });
    let itemName = pkg.name;
    try {
      itemName = getOrInitItem(pkg.packageId).displayName ?? pkg.name;
    } catch {
      /* catalogue fallback */
    }
    const source =
      resolved.source === "unset"
        ? ("unset" as const)
        : resolved.source === "catalogue"
          ? ("catalogue" as const)
          : ("admin" as const);
    return {
      packageId: pkg.packageId,
      name: itemName,
      status: resolved.status,
      selfServe: pkg.selfServe,
      amountCents: resolved.amountCents,
      currency: resolved.currency,
      source,
      pricingUnit: resolved.pricingUnit,
    };
  });
}

export function listUnsetResolvedPackagePriceFields(): readonly string[] {
  hydrateCommercialConfig();
  return listPackages({ activeOnly: false })
    .filter((pkg) => pkg.selfServe || pkg.status === "available")
    .filter((pkg) => {
      const resolved = resolveListPrice({
        packageId: pkg.packageId,
        regionId: "SOUTH_AFRICA",
        layer: "published",
      });
      return resolved.amountCents == null;
    })
    .map((pkg) => `${pkg.packageId}.amountCents`);
}

export function listResolvedProductPrices(): readonly {
  readonly productKey: string;
  readonly name: string;
  readonly status: string;
  readonly amountCents: number | null;
  readonly currency: string;
  readonly source: "catalogue" | "admin" | "unset";
}[] {
  hydrateCommercialConfig();
  return listProducts().map((product) => {
    const overlayAmount = legacyProductAmount(product.productKey);
    const amountCents =
      typeof overlayAmount === "number" ? overlayAmount : product.amountCents;
    return {
      productKey: product.productKey,
      name: product.name,
      status: product.status,
      amountCents,
      currency: product.currency,
      source:
        typeof overlayAmount === "number"
          ? ("admin" as const)
          : product.amountCents == null
            ? ("unset" as const)
            : ("catalogue" as const),
    };
  });
}

export function listUnsetLegacyPackageIds(): readonly string[] {
  hydrateCommercialConfig();
  return listPackages({ activeOnly: false })
    .filter((pkg) => pkg.selfServe)
    .filter(
      (pkg) => legacyPackageAmount(pkg.packageId) == null && pkg.amountCents == null,
    )
    .map((pkg) => pkg.packageId);
}
