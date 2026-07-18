import type {
  AssignSupportTicketOwnerInput,
  ChangeSupportTicketPriorityInput,
  ChangeSupportTicketStateInput,
  CreateSupportArticleInput,
  CreateSupportCustomerReplyInput,
  CreateSupportGroupInput,
  CreateSupportInternalNoteInput,
  CreateSupportOrganizationInput,
  CreateSupportTicketInput,
  ListQuery,
  PageResult,
  ServiceRequestContext,
  SupportAnalyticsService,
  SupportArticle,
  SupportArticleId,
  SupportArticleListFilter,
  SupportArticleService,
  SupportArticleSortField,
  SupportGroup,
  SupportGroupId,
  SupportGroupListFilter,
  SupportGroupService,
  SupportGroupSortField,
  SupportHistoryEvent,
  SupportHistoryListFilter,
  SupportHistoryService,
  SupportHistorySortField,
  SupportIntelligenceSnapshot,
  SupportOrganization,
  SupportOrganizationId,
  SupportOrganizationListFilter,
  SupportOrganizationService,
  SupportOrganizationSortField,
  SupportSearchResult,
  SupportSearchFilter,
  SupportSearchService,
  SupportSearchSortField,
  SupportService,
  SupportTicket,
  SupportTicketId,
  SupportTicketListFilter,
  SupportTicketSortField,
  SupportTimeline,
  SupportUser,
  SupportUserId,
  SupportUserListFilter,
  SupportUserService,
  SupportUserSortField,
  UpdateSupportGroupInput,
  UpdateSupportOrganizationInput,
  UpdateSupportTicketInput,
} from "@apzhub/platform-service-contracts";

import type { MappingOrchestrator } from "../orchestration/mapping-orchestrator";
import type { ProviderResolver } from "../providers/registry/provider-resolver";
import type { ProviderRegistration } from "../providers/types";
import {
  assertRequestContext,
  findSupportRegistration,
  resolveOptionalOutboundSupportId,
  resolveOutboundSupportId,
  toPlatformSupportId,
} from "./support-mapping-helpers";

/** Mapping-aware SupportService — consumers see APZHUB global IDs only. */
export class SupportServiceImpl implements SupportService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async listSupportRequests(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportTicketListFilter, SupportTicketSortField>,
  ): Promise<PageResult<SupportTicket>> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportRequestProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_request",
      provider,
    );

    const providerQuery = query
      ? {
          ...query,
          filter: await this.translateTicketFilterOutbound(
            ctx,
            registration,
            query.filter ?? {},
          ),
        }
      : undefined;

    const result = await provider.listSupportRequests(ctx, providerQuery);
    const items: SupportTicket[] = [];
    for (const ticket of result.items) {
      items.push(await this.normalizeTicket(ctx, registration, ticket));
    }
    return { ...result, items };
  }

  async getSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
  ): Promise<SupportTicket> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(
      ctx,
      supportRequestId,
      "support_request",
    );
    const provider = this.resolver.resolveSupportRequestProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_request",
      provider,
    );
    const ticket = await provider.getSupportRequest(ctx, resolved.providerNativeId);
    return this.normalizeTicket(ctx, registration, ticket, resolved.mapping.platformId);
  }

  async createSupportRequest(
    ctx: ServiceRequestContext,
    input: CreateSupportTicketInput,
  ): Promise<SupportTicket> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportRequestProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_request",
      provider,
    );
    const providerInput = await this.translateCreateTicketOutbound(ctx, input);
    const created = await provider.createSupportRequest(ctx, providerInput);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "support_request",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
    });
    return this.normalizeTicket(ctx, registration, created, mapping.platformId);
  }

  async updateSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
    input: UpdateSupportTicketInput,
  ): Promise<SupportTicket> {
    assertRequestContext(ctx);
    const { resolved, provider, registration } = await this.resolveTicketContext(
      ctx,
      supportRequestId,
    );
    const providerInput = await this.translateUpdateTicketOutbound(ctx, input);
    const updated = await provider.updateSupportRequest(
      ctx,
      resolved.providerNativeId,
      providerInput,
    );
    return this.normalizeTicket(
      ctx,
      registration,
      updated,
      resolved.mapping.platformId,
    );
  }

  async closeSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
  ): Promise<SupportTicket> {
    assertRequestContext(ctx);
    const { resolved, provider, registration } = await this.resolveTicketContext(
      ctx,
      supportRequestId,
    );
    const closed = await provider.closeSupportRequest(ctx, resolved.providerNativeId);
    return this.normalizeTicket(ctx, registration, closed, resolved.mapping.platformId);
  }

  async reopenSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
  ): Promise<SupportTicket> {
    assertRequestContext(ctx);
    const { resolved, provider, registration } = await this.resolveTicketContext(
      ctx,
      supportRequestId,
    );
    const reopened = await provider.reopenSupportRequest(
      ctx,
      resolved.providerNativeId,
    );
    return this.normalizeTicket(
      ctx,
      registration,
      reopened,
      resolved.mapping.platformId,
    );
  }

  async assignSupportRequest(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
    input: AssignSupportTicketOwnerInput,
  ): Promise<SupportTicket> {
    assertRequestContext(ctx);
    const { resolved, provider, registration } = await this.resolveTicketContext(
      ctx,
      supportRequestId,
    );
    const providerInput = await this.translateAssignOutbound(ctx, input);
    const assigned = await provider.assignSupportRequest(
      ctx,
      resolved.providerNativeId,
      providerInput,
    );
    return this.normalizeTicket(
      ctx,
      registration,
      assigned,
      resolved.mapping.platformId,
    );
  }

  async changeSupportRequestPriority(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
    input: ChangeSupportTicketPriorityInput,
  ): Promise<SupportTicket> {
    assertRequestContext(ctx);
    const { resolved, provider, registration } = await this.resolveTicketContext(
      ctx,
      supportRequestId,
    );
    const updated = await provider.changeSupportRequestPriority(
      ctx,
      resolved.providerNativeId,
      input,
    );
    return this.normalizeTicket(
      ctx,
      registration,
      updated,
      resolved.mapping.platformId,
    );
  }

  async changeSupportRequestState(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
    input: ChangeSupportTicketStateInput,
  ): Promise<SupportTicket> {
    assertRequestContext(ctx);
    const { resolved, provider, registration } = await this.resolveTicketContext(
      ctx,
      supportRequestId,
    );
    const updated = await provider.changeSupportRequestState(
      ctx,
      resolved.providerNativeId,
      input,
    );
    return this.normalizeTicket(
      ctx,
      registration,
      updated,
      resolved.mapping.platformId,
    );
  }

  async searchSupportRequests(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportTicketListFilter, SupportTicketSortField>,
  ): Promise<PageResult<SupportTicket>> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportRequestProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_request",
      provider,
    );
    const providerQuery = query
      ? {
          ...query,
          filter: await this.translateTicketFilterOutbound(
            ctx,
            registration,
            query.filter ?? {},
          ),
        }
      : undefined;
    const result = await provider.searchSupportRequests(ctx, providerQuery);
    const items: SupportTicket[] = [];
    for (const ticket of result.items) {
      items.push(await this.normalizeTicket(ctx, registration, ticket));
    }
    return { ...result, items };
  }

  private async resolveTicketContext(
    ctx: ServiceRequestContext,
    supportRequestId: SupportTicketId,
  ) {
    const resolved = await this.mapping.resolveExisting(
      ctx,
      supportRequestId,
      "support_request",
    );
    const provider = this.resolver.resolveSupportRequestProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_request",
      provider,
    );
    return { resolved, provider, registration };
  }

  private async translateTicketFilterOutbound(
    ctx: ServiceRequestContext,
    _registration: ProviderRegistration,
    filter: SupportTicketListFilter,
  ): Promise<SupportTicketListFilter> {
    return {
      ...filter,
      groupId: filter.groupId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            filter.groupId,
            "support_group",
          )
        : filter.groupId,
      assigneeId:
        typeof filter.assigneeId === "string"
          ? await resolveOutboundSupportId(
              this.mapping,
              ctx,
              filter.assigneeId,
              "support_user",
            )
          : filter.assigneeId,
      requesterId: filter.requesterId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            filter.requesterId,
            "support_user",
          )
        : filter.requesterId,
      organizationId: filter.organizationId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            filter.organizationId,
            "support_organization",
          )
        : filter.organizationId,
    };
  }

  private async translateCreateTicketOutbound(
    ctx: ServiceRequestContext,
    input: CreateSupportTicketInput,
  ): Promise<CreateSupportTicketInput> {
    return {
      ...input,
      groupId: await resolveOutboundSupportId(
        this.mapping,
        ctx,
        input.groupId,
        "support_group",
      ),
      requesterId: await resolveOutboundSupportId(
        this.mapping,
        ctx,
        input.requesterId,
        "support_user",
      ),
      assigneeId: input.assigneeId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            input.assigneeId,
            "support_user",
          )
        : input.assigneeId,
      organizationId: input.organizationId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            input.organizationId,
            "support_organization",
          )
        : input.organizationId,
    };
  }

  private async translateUpdateTicketOutbound(
    ctx: ServiceRequestContext,
    input: UpdateSupportTicketInput,
  ): Promise<UpdateSupportTicketInput> {
    return {
      ...input,
      groupId: input.groupId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            input.groupId,
            "support_group",
          )
        : input.groupId,
      requesterId: input.requesterId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            input.requesterId,
            "support_user",
          )
        : input.requesterId,
      assigneeId: await resolveOptionalOutboundSupportId(
        this.mapping,
        ctx,
        input.assigneeId,
        "support_user",
      ),
      organizationId: await resolveOptionalOutboundSupportId(
        this.mapping,
        ctx,
        input.organizationId,
        "support_organization",
      ),
    };
  }

  private async translateAssignOutbound(
    ctx: ServiceRequestContext,
    input: AssignSupportTicketOwnerInput,
  ): Promise<AssignSupportTicketOwnerInput> {
    if (input.assigneeId === null) {
      return { assigneeId: null };
    }
    return {
      assigneeId: await resolveOutboundSupportId(
        this.mapping,
        ctx,
        input.assigneeId,
        "support_user",
      ),
    };
  }

  private async normalizeTicket(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    ticket: SupportTicket,
    knownPlatformId?: string,
  ): Promise<SupportTicket> {
    const platformId = await toPlatformSupportId(
      this.mapping,
      ctx,
      registration,
      "support_request",
      ticket.id,
      undefined,
      knownPlatformId,
    );

    const groupRegistration = findSupportRegistration(
      this.resolver,
      "support_group",
      this.resolver.resolveSupportGroupProvider(ctx, {
        mappedProviderId: registration.providerId,
        mappedIntegrationId: registration.integrationId,
      }),
    );
    const userRegistration = findSupportRegistration(
      this.resolver,
      "support_user",
      this.resolver.resolveSupportUserProvider(ctx, {
        mappedProviderId: registration.providerId,
        mappedIntegrationId: registration.integrationId,
      }),
    );
    const orgRegistration = findSupportRegistration(
      this.resolver,
      "support_organization",
      this.resolver.resolveSupportOrganizationProvider(ctx, {
        mappedProviderId: registration.providerId,
        mappedIntegrationId: registration.integrationId,
      }),
    );

    const groupId = await toPlatformSupportId(
      this.mapping,
      ctx,
      groupRegistration,
      "support_group",
      ticket.groupId,
    );

    const requesterId = await toPlatformSupportId(
      this.mapping,
      ctx,
      userRegistration,
      "support_user",
      ticket.requesterId,
    );

    let assigneeId: string | undefined;
    if (ticket.assigneeId) {
      assigneeId = await toPlatformSupportId(
        this.mapping,
        ctx,
        userRegistration,
        "support_user",
        ticket.assigneeId,
      );
    }

    let organizationId: string | undefined;
    if (ticket.organizationId) {
      organizationId = await toPlatformSupportId(
        this.mapping,
        ctx,
        orgRegistration,
        "support_organization",
        ticket.organizationId,
      );
    }

    return {
      ...ticket,
      id: platformId,
      tenantId: ctx.tenantId,
      groupId,
      requesterId,
      assigneeId,
      organizationId,
    };
  }
}

/** Mapping-aware SupportOrganizationService. */
export class SupportOrganizationServiceImpl implements SupportOrganizationService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async listOrganizations(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportOrganizationListFilter, SupportOrganizationSortField>,
  ): Promise<PageResult<SupportOrganization>> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportOrganizationProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_organization",
      provider,
    );
    const result = await provider.listOrganizations(ctx, query);
    const items: SupportOrganization[] = [];
    for (const org of result.items) {
      items.push(await this.normalizeOrganization(ctx, registration, org));
    }
    return { ...result, items };
  }

  async getOrganization(
    ctx: ServiceRequestContext,
    organizationId: SupportOrganizationId,
  ): Promise<SupportOrganization> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(
      ctx,
      organizationId,
      "support_organization",
    );
    const provider = this.resolver.resolveSupportOrganizationProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_organization",
      provider,
    );
    const org = await provider.getOrganization(ctx, resolved.providerNativeId);
    return this.normalizeOrganization(
      ctx,
      registration,
      org,
      resolved.mapping.platformId,
    );
  }

  async createOrganization(
    ctx: ServiceRequestContext,
    input: CreateSupportOrganizationInput,
  ): Promise<SupportOrganization> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportOrganizationProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_organization",
      provider,
    );
    const created = await provider.createOrganization(ctx, input);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "support_organization",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
    });
    return this.normalizeOrganization(ctx, registration, created, mapping.platformId);
  }

  async updateOrganization(
    ctx: ServiceRequestContext,
    organizationId: SupportOrganizationId,
    input: UpdateSupportOrganizationInput,
  ): Promise<SupportOrganization> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(
      ctx,
      organizationId,
      "support_organization",
    );
    const provider = this.resolver.resolveSupportOrganizationProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_organization",
      provider,
    );
    const updated = await provider.updateOrganization(
      ctx,
      resolved.providerNativeId,
      input,
    );
    return this.normalizeOrganization(
      ctx,
      registration,
      updated,
      resolved.mapping.platformId,
    );
  }

  async archiveOrganization(
    ctx: ServiceRequestContext,
    organizationId: SupportOrganizationId,
  ): Promise<SupportOrganization> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(
      ctx,
      organizationId,
      "support_organization",
    );
    const provider = this.resolver.resolveSupportOrganizationProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_organization",
      provider,
    );
    const archived = await provider.archiveOrganization(ctx, resolved.providerNativeId);
    return this.normalizeOrganization(
      ctx,
      registration,
      archived,
      resolved.mapping.platformId,
    );
  }

  private async normalizeOrganization(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    org: SupportOrganization,
    knownPlatformId?: string,
  ): Promise<SupportOrganization> {
    const platformId = await toPlatformSupportId(
      this.mapping,
      ctx,
      registration,
      "support_organization",
      org.id,
      undefined,
      knownPlatformId,
    );
    return { ...org, id: platformId, tenantId: ctx.tenantId };
  }
}

/** Mapping-aware SupportGroupService. */
export class SupportGroupServiceImpl implements SupportGroupService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async listGroups(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportGroupListFilter, SupportGroupSortField>,
  ): Promise<PageResult<SupportGroup>> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportGroupProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_group",
      provider,
    );
    const result = await provider.listGroups(ctx, query);
    const items: SupportGroup[] = [];
    for (const group of result.items) {
      items.push(await this.normalizeGroup(ctx, registration, group));
    }
    return { ...result, items };
  }

  async getGroup(
    ctx: ServiceRequestContext,
    groupId: SupportGroupId,
  ): Promise<SupportGroup> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(ctx, groupId, "support_group");
    const provider = this.resolver.resolveSupportGroupProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_group",
      provider,
    );
    const group = await provider.getGroup(ctx, resolved.providerNativeId);
    return this.normalizeGroup(ctx, registration, group, resolved.mapping.platformId);
  }

  async createGroup(
    ctx: ServiceRequestContext,
    input: CreateSupportGroupInput,
  ): Promise<SupportGroup> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportGroupProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_group",
      provider,
    );
    const created = await provider.createGroup(ctx, input);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "support_group",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
    });
    return this.normalizeGroup(ctx, registration, created, mapping.platformId);
  }

  async updateGroup(
    ctx: ServiceRequestContext,
    groupId: SupportGroupId,
    input: UpdateSupportGroupInput,
  ): Promise<SupportGroup> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(ctx, groupId, "support_group");
    const provider = this.resolver.resolveSupportGroupProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_group",
      provider,
    );
    const updated = await provider.updateGroup(ctx, resolved.providerNativeId, input);
    return this.normalizeGroup(ctx, registration, updated, resolved.mapping.platformId);
  }

  private async normalizeGroup(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    group: SupportGroup,
    knownPlatformId?: string,
  ): Promise<SupportGroup> {
    const platformId = await toPlatformSupportId(
      this.mapping,
      ctx,
      registration,
      "support_group",
      group.id,
      undefined,
      knownPlatformId,
    );
    return { ...group, id: platformId, tenantId: ctx.tenantId };
  }
}

/** Mapping-aware SupportUserService. */
export class SupportUserServiceImpl implements SupportUserService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async listUsers(
    ctx: ServiceRequestContext,
    query?: ListQuery<SupportUserListFilter, SupportUserSortField>,
  ): Promise<PageResult<SupportUser>> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportUserProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_user",
      provider,
    );
    const result = await provider.listUsers(ctx, query);
    const items: SupportUser[] = [];
    for (const user of result.items) {
      items.push(await this.normalizeUser(ctx, registration, user));
    }
    return { ...result, items };
  }

  async getUser(
    ctx: ServiceRequestContext,
    userId: SupportUserId,
  ): Promise<SupportUser> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(ctx, userId, "support_user");
    const provider = this.resolver.resolveSupportUserProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_user",
      provider,
    );
    const user = await provider.getUser(ctx, resolved.providerNativeId);
    return this.normalizeUser(ctx, registration, user, resolved.mapping.platformId);
  }

  async lookup(
    ctx: ServiceRequestContext,
    input: { readonly email?: string; readonly login?: string },
  ): Promise<SupportUser | undefined> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportUserProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_user",
      provider,
    );
    const user = await provider.lookup(ctx, input);
    if (!user) return undefined;
    return this.normalizeUser(ctx, registration, user);
  }

  async search(
    ctx: ServiceRequestContext,
    queryText: string,
    query?: ListQuery<SupportUserListFilter, SupportUserSortField>,
  ): Promise<PageResult<SupportUser>> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportUserProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_user",
      provider,
    );
    const result = await provider.search(ctx, queryText, query);
    const items: SupportUser[] = [];
    for (const user of result.items) {
      items.push(await this.normalizeUser(ctx, registration, user));
    }
    return { ...result, items };
  }

  private async normalizeUser(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    user: SupportUser,
    knownPlatformId?: string,
  ): Promise<SupportUser> {
    const platformId = await toPlatformSupportId(
      this.mapping,
      ctx,
      registration,
      "support_user",
      user.id,
      undefined,
      knownPlatformId,
    );

    let organizationIds: readonly string[] | undefined;
    if (user.organizationIds?.length) {
      organizationIds = await Promise.all(
        user.organizationIds.map((id) =>
          toPlatformSupportId(
            this.mapping,
            ctx,
            registration,
            "support_organization",
            id,
          ),
        ),
      );
    }

    return { ...user, id: platformId, tenantId: ctx.tenantId, organizationIds };
  }
}

/** Mapping-aware SupportArticleService. */
export class SupportArticleServiceImpl implements SupportArticleService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async list(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    query?: ListQuery<SupportArticleListFilter, SupportArticleSortField>,
  ): Promise<PageResult<SupportArticle>> {
    assertRequestContext(ctx);
    const ticket = await this.mapping.resolveExisting(
      ctx,
      supportTicketId,
      "support_request",
    );
    const provider = this.resolver.resolveSupportArticleProvider(ctx, {
      mappedProviderId: ticket.providerId,
      mappedIntegrationId: ticket.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_article",
      provider,
    );
    const providerQuery = query
      ? {
          ...query,
          filter: await this.translateArticleFilterOutbound(
            ctx,
            registration,
            query.filter ?? {},
          ),
        }
      : undefined;
    const result = await provider.list(ctx, ticket.providerNativeId, providerQuery);
    const items: SupportArticle[] = [];
    for (const article of result.items) {
      items.push(
        await this.normalizeArticle(
          ctx,
          registration,
          article,
          ticket.mapping.platformId,
        ),
      );
    }
    return { ...result, items };
  }

  async get(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    articleId: SupportArticleId,
  ): Promise<SupportArticle> {
    assertRequestContext(ctx);
    const ticket = await this.mapping.resolveExisting(
      ctx,
      supportTicketId,
      "support_request",
    );
    const articleResolved = await this.mapping.resolveExisting(
      ctx,
      articleId,
      "support_article",
    );
    const provider = this.resolver.resolveSupportArticleProvider(ctx, {
      mappedProviderId: ticket.providerId,
      mappedIntegrationId: ticket.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_article",
      provider,
    );
    const article = await provider.get(
      ctx,
      ticket.providerNativeId,
      articleResolved.providerNativeId,
    );
    return this.normalizeArticle(
      ctx,
      registration,
      article,
      ticket.mapping.platformId,
      articleResolved.mapping.platformId,
    );
  }

  async createNote(
    ctx: ServiceRequestContext,
    input: CreateSupportInternalNoteInput,
  ): Promise<SupportArticle> {
    return this.createArticle(ctx, input, (provider, translated) =>
      provider.createNote(ctx, translated as CreateSupportInternalNoteInput),
    );
  }

  async createReply(
    ctx: ServiceRequestContext,
    input: CreateSupportCustomerReplyInput,
  ): Promise<SupportArticle> {
    return this.createArticle(ctx, input, (provider, translated) =>
      provider.createReply(ctx, translated as CreateSupportCustomerReplyInput),
    );
  }

  async create(
    ctx: ServiceRequestContext,
    input: CreateSupportArticleInput,
  ): Promise<SupportArticle> {
    return this.createArticle(ctx, input, (provider, translated) =>
      provider.create(ctx, translated as CreateSupportArticleInput),
    );
  }

  private async createArticle(
    ctx: ServiceRequestContext,
    input: { supportTicketId: string },
    invoke: (
      provider: ReturnType<ProviderResolver["resolveSupportArticleProvider"]>,
      translated: typeof input,
    ) => Promise<SupportArticle>,
  ): Promise<SupportArticle> {
    assertRequestContext(ctx);
    const ticket = await this.mapping.resolveExisting(
      ctx,
      input.supportTicketId,
      "support_request",
    );
    const provider = this.resolver.resolveSupportArticleProvider(ctx, {
      mappedProviderId: ticket.providerId,
      mappedIntegrationId: ticket.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_article",
      provider,
    );
    const translated = {
      ...input,
      supportTicketId: ticket.providerNativeId,
    };
    const created = await invoke(provider, translated);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "support_article",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
      parentPlatformId: ticket.mapping.platformId,
      parentProviderNativeId: ticket.providerNativeId,
    });
    return this.normalizeArticle(
      ctx,
      registration,
      created,
      ticket.mapping.platformId,
      mapping.platformId,
    );
  }

  private async translateArticleFilterOutbound(
    ctx: ServiceRequestContext,
    _registration: ProviderRegistration,
    filter: SupportArticleListFilter,
  ): Promise<SupportArticleListFilter> {
    return {
      ...filter,
      authorId: filter.authorId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            filter.authorId,
            "support_user",
          )
        : filter.authorId,
    };
  }

  private async normalizeArticle(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    article: SupportArticle,
    ticketPlatformId: string,
    knownPlatformId?: string,
  ): Promise<SupportArticle> {
    const platformId = await toPlatformSupportId(
      this.mapping,
      ctx,
      registration,
      "support_article",
      article.id,
      undefined,
      knownPlatformId,
    );

    const supportTicketId = await toPlatformSupportId(
      this.mapping,
      ctx,
      registration,
      "support_request",
      article.supportTicketId,
      undefined,
      ticketPlatformId,
    );

    let authorUserId: string | undefined;
    if (article.author.userId) {
      authorUserId = await toPlatformSupportId(
        this.mapping,
        ctx,
        registration,
        "support_user",
        article.author.userId,
      );
    }

    return {
      ...article,
      id: platformId,
      tenantId: ctx.tenantId,
      supportTicketId,
      author: { ...article.author, userId: authorUserId },
    };
  }
}

/** Mapping-aware SupportSearchService. */
export class SupportSearchServiceImpl implements SupportSearchService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async search(
    ctx: ServiceRequestContext,
    queryText: string,
    query?: ListQuery<SupportSearchFilter, SupportSearchSortField>,
  ): Promise<SupportSearchResult> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportSearchProvider(ctx);
    const registration = findSupportRegistration(
      this.resolver,
      "support_search",
      provider,
    );
    const providerQuery = query
      ? {
          ...query,
          filter: await this.translateSearchFilterOutbound(ctx, query.filter ?? {}),
        }
      : undefined;
    const result = await provider.search(ctx, queryText, providerQuery);
    const hits = await Promise.all(
      result.hits.map((hit) => this.normalizeSearchHit(ctx, registration, hit)),
    );
    return { ...result, hits };
  }

  private async translateSearchFilterOutbound(
    ctx: ServiceRequestContext,
    filter: SupportSearchFilter,
  ): Promise<SupportSearchFilter> {
    return {
      ...filter,
      supportTicketId: filter.supportTicketId
        ? (
            await this.mapping.resolveExisting(
              ctx,
              filter.supportTicketId,
              "support_request",
            )
          ).providerNativeId
        : filter.supportTicketId,
      organizationId: filter.organizationId
        ? (
            await this.mapping.resolveExisting(
              ctx,
              filter.organizationId,
              "support_organization",
            )
          ).providerNativeId
        : filter.organizationId,
      groupId: filter.groupId
        ? (await this.mapping.resolveExisting(ctx, filter.groupId, "support_group"))
            .providerNativeId
        : filter.groupId,
    };
  }

  private async normalizeSearchHit(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    hit: SupportSearchResult["hits"][number],
  ): Promise<SupportSearchResult["hits"][number]> {
    let supportTicketId: string | undefined;
    if (hit.supportTicketId) {
      supportTicketId = await toPlatformSupportId(
        this.mapping,
        ctx,
        registration,
        "support_request",
        hit.supportTicketId,
      );
    }
    let organizationId: string | undefined;
    if (hit.organizationId) {
      organizationId = await toPlatformSupportId(
        this.mapping,
        ctx,
        registration,
        "support_organization",
        hit.organizationId,
      );
    }
    let groupId: string | undefined;
    if (hit.groupId) {
      groupId = await toPlatformSupportId(
        this.mapping,
        ctx,
        registration,
        "support_group",
        hit.groupId,
      );
    }
    let userId: string | undefined;
    if (hit.userId) {
      userId = await toPlatformSupportId(
        this.mapping,
        ctx,
        registration,
        "support_user",
        hit.userId,
      );
    }
    let articleId: string | undefined;
    if (hit.articleId) {
      articleId = await toPlatformSupportId(
        this.mapping,
        ctx,
        registration,
        "support_article",
        hit.articleId,
      );
    }
    return {
      ...hit,
      supportTicketId,
      organizationId,
      groupId,
      userId,
      articleId,
    };
  }
}

/** Mapping-aware SupportHistoryService. */
export class SupportHistoryServiceImpl implements SupportHistoryService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async getTimeline(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    query?: ListQuery<SupportHistoryListFilter, SupportHistorySortField>,
  ): Promise<PageResult<SupportHistoryEvent>> {
    assertRequestContext(ctx);
    const ticket = await this.resolveTicket(ctx, supportTicketId);
    const providerQuery = query
      ? {
          ...query,
          filter: await this.translateHistoryFilterOutbound(ctx, query.filter ?? {}),
        }
      : undefined;
    const result = await ticket.provider.getTimeline(
      ctx,
      ticket.nativeId,
      providerQuery,
    );
    const items = await Promise.all(
      result.items.map((event) =>
        this.normalizeEvent(ctx, ticket.registration, event, ticket.platformId),
      ),
    );
    return { ...result, items };
  }

  async list(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
    query?: ListQuery<SupportHistoryListFilter, SupportHistorySortField>,
  ): Promise<PageResult<SupportHistoryEvent>> {
    return this.getTimeline(ctx, supportTicketId, query);
  }

  async getSupportTimeline(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
  ): Promise<SupportTimeline> {
    assertRequestContext(ctx);
    const ticket = await this.resolveTicket(ctx, supportTicketId);
    const timeline = await ticket.provider.getSupportTimeline(ctx, ticket.nativeId);
    const events = await Promise.all(
      timeline.events.map((event) =>
        this.normalizeEvent(ctx, ticket.registration, event, ticket.platformId),
      ),
    );
    return { ...timeline, supportTicketId: ticket.platformId, events };
  }

  private async resolveTicket(
    ctx: ServiceRequestContext,
    supportTicketId: SupportTicketId,
  ) {
    const resolved = await this.mapping.resolveExisting(
      ctx,
      supportTicketId,
      "support_request",
    );
    const provider = this.resolver.resolveSupportHistoryProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findSupportRegistration(
      this.resolver,
      "support_history",
      provider,
    );
    return {
      provider,
      registration,
      nativeId: resolved.providerNativeId,
      platformId: resolved.mapping.platformId,
    };
  }

  private async translateHistoryFilterOutbound(
    ctx: ServiceRequestContext,
    filter: SupportHistoryListFilter,
  ): Promise<SupportHistoryListFilter> {
    return {
      ...filter,
      actorId: filter.actorId
        ? await resolveOutboundSupportId(
            this.mapping,
            ctx,
            filter.actorId,
            "support_user",
          )
        : filter.actorId,
    };
  }

  private async normalizeEvent(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    event: SupportHistoryEvent,
    ticketPlatformId: string,
  ): Promise<SupportHistoryEvent> {
    const platformEventId = event.id;
    let actorUserId: string | undefined;
    if (event.actor.userId) {
      actorUserId = await toPlatformSupportId(
        this.mapping,
        ctx,
        registration,
        "support_user",
        event.actor.userId,
      );
    }
    let articleId: string | undefined;
    if (event.articleId) {
      articleId = await toPlatformSupportId(
        this.mapping,
        ctx,
        registration,
        "support_article",
        event.articleId,
      );
    }
    return {
      ...event,
      id: platformEventId,
      supportTicketId: ticketPlatformId,
      actor: { ...event.actor, userId: actorUserId },
      articleId,
    };
  }
}

/** Read-only mapping-aware SupportAnalyticsService. */
export class SupportAnalyticsServiceImpl implements SupportAnalyticsService {
  constructor(private readonly resolver: ProviderResolver) {}

  async getSupportIntelligence(
    ctx: ServiceRequestContext,
  ): Promise<SupportIntelligenceSnapshot> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportAnalyticsProvider(ctx);
    return provider.getSupportIntelligence(ctx);
  }

  async getSnapshot(ctx: ServiceRequestContext): Promise<SupportIntelligenceSnapshot> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveSupportAnalyticsProvider(ctx);
    return provider.getSnapshot(ctx);
  }
}
