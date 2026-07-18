import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  DependencyGraphService,
  DependencyHealthSummary,
  DependencyValidationResult,
  ProductDependency,
  ProductDependencyCreateInput,
} from "@apzhub/testing-contracts";
import {
  asProductDependencyId,
  type GovernedProductId,
  type ProductDependencyId,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../lifecycle/state-machines";
import type { Clock, IdGenerator } from "../services/types";
import type { PlatformQualityStore } from "./store";

export interface DependencyGraphServiceDeps {
  readonly store: PlatformQualityStore;
  readonly now: Clock;
  readonly id: IdGenerator;
}

function dependencyEdge(dep: ProductDependency): {
  from: GovernedProductId;
  to: GovernedProductId;
} {
  if (dep.relation === "upstream") {
    return { from: dep.fromProductId, to: dep.toProductId };
  }
  return { from: dep.toProductId, to: dep.fromProductId };
}

function detectCycles(
  deps: readonly ProductDependency[],
  scope?: ReadonlySet<GovernedProductId>,
): { cycleDetected: boolean; cycleProductIds: GovernedProductId[] } {
  const adjacency = new Map<GovernedProductId, GovernedProductId[]>();
  for (const dep of deps) {
    const { from, to } = dependencyEdge(dep);
    if (scope && (!scope.has(from) || !scope.has(to))) continue;
    const list = adjacency.get(from) ?? [];
    list.push(to);
    adjacency.set(from, list);
  }

  const visited = new Set<GovernedProductId>();
  const stack = new Set<GovernedProductId>();
  const path: GovernedProductId[] = [];
  let cycleProductIds: GovernedProductId[] = [];

  function dfs(node: GovernedProductId): boolean {
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const next of adjacency.get(node) ?? []) {
      if (!visited.has(next)) {
        if (dfs(next)) return true;
      } else if (stack.has(next)) {
        const idx = path.indexOf(next);
        cycleProductIds = path.slice(idx);
        return true;
      }
    }
    path.pop();
    stack.delete(node);
    return false;
  }

  const nodes =
    scope ??
    new Set<GovernedProductId>(
      [...adjacency.keys()].concat([...adjacency.values()].flatMap((v) => v)),
    );

  for (const node of nodes) {
    if (!visited.has(node) && dfs(node)) {
      return { cycleDetected: true, cycleProductIds };
    }
  }
  return { cycleDetected: false, cycleProductIds: [] };
}

export function createDependencyGraphService(
  deps: DependencyGraphServiceDeps,
): DependencyGraphService {
  const { store, now, id } = deps;

  function listTenantDeps(ctx: ServiceRequestContext): ProductDependency[] {
    return [...store.dependencies.values()].filter((d) => d.tenantId === ctx.tenantId);
  }

  function productExists(
    ctx: ServiceRequestContext,
    productId: GovernedProductId,
  ): boolean {
    const product = store.products.get(productId);
    return product !== undefined && product.tenantId === ctx.tenantId;
  }

  function attachDependencyToProduct(
    productId: GovernedProductId,
    dependencyId: ProductDependencyId,
  ): void {
    const product = store.products.get(productId);
    if (!product) return;
    if (product.dependencyIds.includes(dependencyId)) return;
    store.products.set(productId, {
      ...product,
      dependencyIds: [...product.dependencyIds, dependencyId],
      updatedAt: now(),
    });
  }

  function detachDependencyFromProduct(
    productId: GovernedProductId,
    dependencyId: ProductDependencyId,
  ): void {
    const product = store.products.get(productId);
    if (!product) return;
    store.products.set(productId, {
      ...product,
      dependencyIds: product.dependencyIds.filter((d) => d !== dependencyId),
      updatedAt: now(),
    });
  }

  const service: DependencyGraphService = {
    async addDependency(
      ctx: ServiceRequestContext,
      input: ProductDependencyCreateInput,
    ): Promise<ProductDependency> {
      if (input.fromProductId === input.toProductId) {
        throw new DomainRuleError(
          "invalid_dependency",
          "A product cannot depend on itself",
          { fromProductId: input.fromProductId },
        );
      }
      if (!productExists(ctx, input.fromProductId)) {
        throw new DomainRuleError(
          "product_not_found",
          `Governed product ${input.fromProductId} not found`,
          { productId: input.fromProductId },
        );
      }
      if (!productExists(ctx, input.toProductId)) {
        throw new DomainRuleError(
          "product_not_found",
          `Governed product ${input.toProductId} not found`,
          { productId: input.toProductId },
        );
      }

      const timestamp = now();
      const dependencyId = asProductDependencyId(id());
      const dependency: ProductDependency = {
        id: dependencyId,
        tenantId: ctx.tenantId,
        fromProductId: input.fromProductId,
        toProductId: input.toProductId,
        relation: input.relation,
        requirement: input.requirement,
        blocked: input.blocked ?? false,
        notes: input.notes,
        organisationId: input.organisationId ?? ctx.organisationId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      store.dependencies.set(dependencyId, dependency);
      attachDependencyToProduct(input.fromProductId, dependencyId);
      attachDependencyToProduct(input.toProductId, dependencyId);
      return dependency;
    },

    async removeDependency(
      ctx: ServiceRequestContext,
      dependencyId: ProductDependencyId,
    ): Promise<void> {
      const dependency = store.dependencies.get(dependencyId);
      if (!dependency || dependency.tenantId !== ctx.tenantId) {
        throw new DomainRuleError(
          "dependency_not_found",
          `Product dependency ${dependencyId} not found`,
          { dependencyId },
        );
      }
      detachDependencyFromProduct(dependency.fromProductId, dependencyId);
      detachDependencyFromProduct(dependency.toProductId, dependencyId);
      store.dependencies.delete(dependencyId);
    },

    async listDependencies(
      ctx: ServiceRequestContext,
    ): Promise<readonly ProductDependency[]> {
      return listTenantDeps(ctx);
    },

    async listForProduct(
      ctx: ServiceRequestContext,
      productId: GovernedProductId,
    ): Promise<readonly ProductDependency[]> {
      return listTenantDeps(ctx).filter(
        (d) => d.fromProductId === productId || d.toProductId === productId,
      );
    },

    async validate(
      ctx: ServiceRequestContext,
      productIds?: readonly GovernedProductId[],
    ): Promise<DependencyValidationResult> {
      const all = listTenantDeps(ctx);
      const scope = productIds !== undefined ? new Set(productIds) : undefined;
      const relevant = scope
        ? all.filter((d) => scope.has(d.fromProductId) || scope.has(d.toProductId))
        : all;

      const missingRequired: ProductDependencyId[] = [];
      const blockedDependencies: ProductDependencyId[] = [];
      const messages: string[] = [];

      for (const dep of relevant) {
        if (dep.blocked) {
          blockedDependencies.push(dep.id);
          messages.push(`blocked:${dep.id}`);
        }
        if (dep.requirement === "required") {
          const { to } = dependencyEdge(dep);
          const targetMissing = !productExists(ctx, to);
          const targetOutOfScope = scope !== undefined && !scope.has(to);
          const targetDisabled = (() => {
            const p = store.products.get(to);
            return p !== undefined && !p.enabled;
          })();
          if (targetMissing || targetOutOfScope || targetDisabled) {
            missingRequired.push(dep.id);
            messages.push(`missing_required:${dep.id}`);
          }
        }
      }

      const cycle = detectCycles(relevant, scope);

      if (cycle.cycleDetected) {
        messages.push("cycle_detected");
      }

      const valid =
        missingRequired.length === 0 &&
        blockedDependencies.length === 0 &&
        !cycle.cycleDetected;

      return {
        valid,
        missingRequired,
        blockedDependencies,
        cycleDetected: cycle.cycleDetected,
        cycleProductIds: cycle.cycleProductIds,
        messages,
        computedAt: now(),
      };
    },

    async healthForProduct(
      ctx: ServiceRequestContext,
      productId: GovernedProductId,
    ): Promise<DependencyHealthSummary> {
      if (!productExists(ctx, productId)) {
        throw new DomainRuleError(
          "product_not_found",
          `Governed product ${productId} not found`,
          { productId },
        );
      }

      const related = await service.listForProduct(ctx, productId);
      let upstreamCount = 0;
      let downstreamCount = 0;
      let requiredCount = 0;
      let optionalCount = 0;
      let blockedCount = 0;

      for (const dep of related) {
        const { from, to } = dependencyEdge(dep);
        if (from === productId) {
          upstreamCount += 1;
        }
        if (to === productId) {
          downstreamCount += 1;
        }
        if (dep.requirement === "required") requiredCount += 1;
        else optionalCount += 1;
        if (dep.blocked) blockedCount += 1;
      }

      const validation = await service.validate(ctx, [productId]);
      let readiness: DependencyHealthSummary["readiness"] = "READY";
      if (
        !validation.valid ||
        validation.cycleDetected ||
        blockedCount > 0 ||
        validation.missingRequired.length > 0
      ) {
        readiness = "NOT_READY";
      } else if (optionalCount > 0 && related.some((d) => d.notes)) {
        readiness = "READY_WITH_WARNINGS";
      }

      return {
        productId,
        upstreamCount,
        downstreamCount,
        requiredCount,
        optionalCount,
        blockedCount,
        readiness,
        computedAt: now(),
      };
    },
  };

  return service;
}
