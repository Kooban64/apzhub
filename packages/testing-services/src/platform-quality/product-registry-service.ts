import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  GovernedProduct,
  ProductRegistry,
  ProductRegistryService,
  ProductRegistryUpsertInput,
} from "@apzhub/testing-contracts";
import {
  asGovernedProductId,
  asProductRegistryId,
  type GovernedProductId,
  type PlatformProductKey,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../lifecycle/state-machines";
import type { Clock, IdGenerator } from "../services/types";
import { DEFAULT_PRODUCTS } from "./defaults";
import type { PlatformQualityStore } from "./store";

export interface ProductRegistryServiceDeps {
  readonly store: PlatformQualityStore;
  readonly now: Clock;
  readonly id: IdGenerator;
}

export function createProductRegistryService(
  deps: ProductRegistryServiceDeps,
): ProductRegistryService {
  const { store, now, id } = deps;

  function requireRegistry(ctx: ServiceRequestContext): ProductRegistry {
    const registryId = store.registryByTenant.get(ctx.tenantId);
    if (!registryId) {
      throw new DomainRuleError(
        "registry_not_found",
        `Product registry not found for tenant ${ctx.tenantId}`,
        { tenantId: ctx.tenantId },
      );
    }
    const registry = store.registries.get(registryId);
    if (!registry) {
      throw new DomainRuleError(
        "registry_not_found",
        `Product registry ${registryId} not found`,
        { registryId },
      );
    }
    return registry;
  }

  function requireProduct(
    ctx: ServiceRequestContext,
    productId: GovernedProductId,
  ): GovernedProduct {
    const product = store.products.get(productId);
    if (!product || product.tenantId !== ctx.tenantId) {
      throw new DomainRuleError(
        "product_not_found",
        `Governed product ${productId} not found`,
        { productId },
      );
    }
    return product;
  }

  const service: ProductRegistryService = {
    async ensureDefaultRegistry(
      ctx: ServiceRequestContext,
    ): Promise<ProductRegistry> {
      const existingId = store.registryByTenant.get(ctx.tenantId);
      if (existingId) {
        const existing = store.registries.get(existingId);
        if (existing) return existing;
      }

      const timestamp = now();
      const registryId = asProductRegistryId(id());
      const productIds: GovernedProductId[] = [];

      for (const spec of DEFAULT_PRODUCTS) {
        const productId = asGovernedProductId(id());
        const product: GovernedProduct = {
          id: productId,
          registryId,
          key: spec.key,
          displayName: spec.displayName,
          owner: spec.owner,
          version: spec.version,
          enabled: true,
          qualityStatus: "unknown",
          certificationStatus: "draft",
          releaseReadiness: "NOT_READY",
          dependencyIds: [],
          tenantId: ctx.tenantId,
          organisationId: ctx.organisationId,
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: ctx.userId,
          updatedBy: ctx.userId,
        };
        store.products.set(productId, product);
        productIds.push(productId);
      }

      const registry: ProductRegistry = {
        id: registryId,
        tenantId: ctx.tenantId,
        name: "APZHUB Product Registry",
        productIds,
        organisationId: ctx.organisationId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      store.registries.set(registryId, registry);
      store.registryByTenant.set(ctx.tenantId, registryId);
      return registry;
    },

    async listProducts(
      ctx: ServiceRequestContext,
    ): Promise<readonly GovernedProduct[]> {
      await service.ensureDefaultRegistry(ctx);
      const registry = requireRegistry(ctx);
      return registry.productIds
        .map((pid) => store.products.get(pid))
        .filter((p): p is GovernedProduct => p !== undefined);
    },

    async getProduct(
      ctx: ServiceRequestContext,
      productId: GovernedProductId,
    ): Promise<GovernedProduct> {
      await service.ensureDefaultRegistry(ctx);
      return requireProduct(ctx, productId);
    },

    async getProductByKey(
      ctx: ServiceRequestContext,
      key: PlatformProductKey,
    ): Promise<GovernedProduct> {
      const products = await service.listProducts(ctx);
      const found = products.find((p) => p.key === key);
      if (!found) {
        throw new DomainRuleError(
          "product_not_found",
          `Governed product with key ${key} not found`,
          { key },
        );
      }
      return found;
    },

    async upsertProduct(
      ctx: ServiceRequestContext,
      input: ProductRegistryUpsertInput,
    ): Promise<GovernedProduct> {
      const registry = await service.ensureDefaultRegistry(ctx);
      const timestamp = now();
      const existing = (await service.listProducts(ctx)).find(
        (p) => p.key === input.key,
      );

      if (existing) {
        const updated: GovernedProduct = {
          ...existing,
          displayName: input.displayName,
          owner: input.owner,
          version: input.version,
          enabled: input.enabled ?? existing.enabled,
          qualityStatus: input.qualityStatus ?? existing.qualityStatus,
          certificationStatus:
            input.certificationStatus ?? existing.certificationStatus,
          releaseReadiness:
            input.releaseReadiness ?? existing.releaseReadiness,
          organisationId: input.organisationId ?? existing.organisationId,
          updatedAt: timestamp,
          updatedBy: ctx.userId,
        };
        store.products.set(existing.id, updated);
        store.registries.set(registry.id, {
          ...registry,
          updatedAt: timestamp,
          updatedBy: ctx.userId,
        });
        return updated;
      }

      const productId = asGovernedProductId(id());
      const created: GovernedProduct = {
        id: productId,
        registryId: registry.id,
        key: input.key,
        displayName: input.displayName,
        owner: input.owner,
        version: input.version,
        enabled: input.enabled ?? true,
        qualityStatus: input.qualityStatus ?? "unknown",
        certificationStatus: input.certificationStatus ?? "draft",
        releaseReadiness: input.releaseReadiness ?? "NOT_READY",
        dependencyIds: [],
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      store.products.set(productId, created);
      store.registries.set(registry.id, {
        ...registry,
        productIds: [...registry.productIds, productId],
        updatedAt: timestamp,
        updatedBy: ctx.userId,
      });
      return created;
    },

    async setEnabled(
      ctx: ServiceRequestContext,
      productId: GovernedProductId,
      enabled: boolean,
    ): Promise<GovernedProduct> {
      await service.ensureDefaultRegistry(ctx);
      const product = requireProduct(ctx, productId);
      const updated: GovernedProduct = {
        ...product,
        enabled,
        updatedAt: now(),
        updatedBy: ctx.userId,
      };
      store.products.set(productId, updated);
      return updated;
    },

    async getRegistry(ctx: ServiceRequestContext): Promise<ProductRegistry> {
      await service.ensureDefaultRegistry(ctx);
      return requireRegistry(ctx);
    },
  };

  return service;
}
