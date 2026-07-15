import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { ZammadGroupRecord } from "../internal/zammad-api-types";
import { extractSupportGroupZammadId } from "../mappers/mapper-context";
import { mapGroupToZammadBody, mapZammadGroup } from "../mappers/group-mapper";
import type { SupportGroup } from "../models/canonical";
import type {
  CreateSupportGroupInput,
  UpdateSupportGroupInput,
} from "../models/inputs";
import type {
  PageRequest,
  PageResult,
  SortField,
  SupportGroupListFilter,
  SupportGroupSortField,
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
  validateZammadGroupResponse,
} from "../validation/response-validation";
import {
  applyClientFilters,
  applyClientSort,
  buildZammadListQuery,
  mapArrayPageResult,
} from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

const GROUP_SORT_FIELDS = [
  "name",
  "createdAt",
  "updatedAt",
] as const satisfies readonly SupportGroupSortField[];

export class ZammadGroupService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    filter: SupportGroupListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<SupportGroupSortField>[] = [],
  ): Promise<PageResult<SupportGroup>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateSortFields(sort, GROUP_SORT_FIELDS),
      ),
      "groups.list",
    );

    return this.deps.runner.run(context, "groups.list", async () => {
      const list = await this.deps.client.listGroups(
        context,
        buildZammadListQuery(page, sort),
      );
      assertValid(validateZammadArrayResponse(list.items), "groups.list.response");

      const mapperCtx = { tenantId: this.deps.serviceContext.tenantId };
      let result = mapArrayPageResult(
        list,
        (item) => {
          assertValid(validateZammadGroupResponse(item), "group.entity");
          return mapZammadGroup(item as ZammadGroupRecord, mapperCtx);
        },
        page,
      );

      result = {
        ...result,
        items: applyClientFilters(result.items, (group) => {
          if (filter.active !== undefined && group.active !== filter.active) return false;
          if (
            filter.search &&
            !group.name.toLowerCase().includes(filter.search.toLowerCase())
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
    groupId: string,
  ): Promise<SupportGroup> {
    return this.deps.runner.run(context, "groups.get", async () => {
      const record = await this.deps.client.getGroup(
        context,
        extractSupportGroupZammadId(groupId),
      );
      assertValid(validateZammadGroupResponse(record), "group.entity");
      return mapZammadGroup(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async create(
    context: IntegrationRequestContext,
    input: CreateSupportGroupInput,
  ): Promise<SupportGroup> {
    assertValid(
      validateRequiredString(input.name, "name", { maxLength: 255 }),
      "groups.create",
    );

    return this.deps.runner.run(context, "groups.create", async () => {
      const record = await this.deps.client.createGroup(
        context,
        mapGroupToZammadBody(input),
      );
      assertValid(validateZammadGroupResponse(record), "group.entity");
      return mapZammadGroup(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }

  async update(
    context: IntegrationRequestContext,
    groupId: string,
    input: UpdateSupportGroupInput,
  ): Promise<SupportGroup> {
    return this.deps.runner.run(context, "groups.update", async () => {
      const record = await this.deps.client.updateGroup(
        context,
        extractSupportGroupZammadId(groupId),
        mapGroupToZammadBody(input),
      );
      assertValid(validateZammadGroupResponse(record), "group.entity");
      return mapZammadGroup(record, {
        tenantId: this.deps.serviceContext.tenantId,
      });
    });
  }
}
