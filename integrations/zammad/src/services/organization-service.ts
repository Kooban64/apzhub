import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { ZammadOrganizationRecord } from "../internal/zammad-api-types";
import { extractSupportOrganizationZammadId } from "../mappers/mapper-context";
import {
  mapOrganizationToZammadBody,
  mapZammadOrganization,
} from "../mappers/organization-mapper";
import type { SupportOrganization } from "../models/canonical";
import type {
  CreateSupportOrganizationInput,
  UpdateSupportOrganizationInput,
} from "../models/inputs";
import type {
  PageRequest,
  PageResult,
  SortField,
  SupportOrganizationListFilter,
  SupportOrganizationSortField,
} from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import {
  validateZammadArrayResponse,
  validateZammadOrganizationResponse,
} from "../validation/response-validation";
import {
  applyClientFilters,
  applyClientSort,
  buildZammadListQuery,
  mapArrayPageResult,
} from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

const ORG_SORT_FIELDS = [
  "name",
  "createdAt",
  "updatedAt",
] as const satisfies readonly SupportOrganizationSortField[];

export class ZammadOrganizationService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    filter: SupportOrganizationListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<SupportOrganizationSortField>[] = [],
  ): Promise<PageResult<SupportOrganization>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateSortFields(sort, ORG_SORT_FIELDS),
      ),
      "organizations.list",
    );

    return this.deps.runner.run(context, "organizations.list", async () => {
      const list = await this.deps.client.listOrganizations(
        context,
        buildZammadListQuery(page, sort, {
          ...(filter.search ? { query: filter.search } : {}),
        }),
      );
      assertValid(
        validateZammadArrayResponse(list.items),
        "organizations.list.response",
      );

      const mapperCtx = { tenantId: this.deps.serviceContext.tenantId };
      let result = mapArrayPageResult(
        list,
        (item) => {
          assertValid(validateZammadOrganizationResponse(item), "organization.entity");
          return mapZammadOrganization(item as ZammadOrganizationRecord, mapperCtx);
        },
        page,
      );

      result = {
        ...result,
        items: applyClientFilters(result.items, (org) => {
          if (filter.active !== undefined && org.active !== filter.active) return false;
          if (
            filter.search &&
            !org.name.toLowerCase().includes(filter.search.toLowerCase())
          ) {
            return false;
          }
          return true;
        }),
      };

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            if (field === "createdAt") return item.createdAt;
            if (field === "updatedAt") return item.updatedAt;
            return item.name;
          }),
        };
      }

      return result;
    });
  }

  async get(
    context: IntegrationRequestContext,
    organizationId: string,
  ): Promise<SupportOrganization> {
    return this.deps.runner.run(context, "organizations.get", async () => {
      const record = await this.deps.client.getOrganization(
        context,
        extractSupportOrganizationZammadId(organizationId),
      );
      assertValid(validateZammadOrganizationResponse(record), "organization.entity");
      return mapZammadOrganization(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async create(
    context: IntegrationRequestContext,
    input: CreateSupportOrganizationInput,
  ): Promise<SupportOrganization> {
    assertValid(
      validateRequiredString(input.name, "name", { maxLength: 255 }),
      "organizations.create",
    );

    return this.deps.runner.run(context, "organizations.create", async () => {
      const record = await this.deps.client.createOrganization(
        context,
        mapOrganizationToZammadBody(input),
      );
      assertValid(validateZammadOrganizationResponse(record), "organization.entity");
      return mapZammadOrganization(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async update(
    context: IntegrationRequestContext,
    organizationId: string,
    input: UpdateSupportOrganizationInput,
  ): Promise<SupportOrganization> {
    return this.deps.runner.run(context, "organizations.update", async () => {
      const record = await this.deps.client.updateOrganization(
        context,
        extractSupportOrganizationZammadId(organizationId),
        mapOrganizationToZammadBody(input),
      );
      assertValid(validateZammadOrganizationResponse(record), "organization.entity");
      return mapZammadOrganization(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  /** Archive where supported — Zammad uses `active: false`. */
  async archive(
    context: IntegrationRequestContext,
    organizationId: string,
  ): Promise<SupportOrganization> {
    return this.deps.runner.run(context, "organizations.archive", async () => {
      const record = await this.deps.client.updateOrganization(
        context,
        extractSupportOrganizationZammadId(organizationId),
        mapOrganizationToZammadBody({ active: false }),
      );
      assertValid(validateZammadOrganizationResponse(record), "organization.entity");
      return mapZammadOrganization(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }
}
