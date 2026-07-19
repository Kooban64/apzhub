import type { ServiceRequestContext } from "../../common/context";
import type { ListQuery } from "../../common/list-query";
import type { PageResult } from "../../common/paging";
import type { TimeCustomer } from "../../domain/time";
import type { TimeCustomerId } from "../../domain/identifiers";

export interface CreateTimeCustomerInput {
  readonly name: string;
  readonly number?: string;
}

export interface UpdateTimeCustomerInput {
  readonly name?: string;
  readonly number?: string;
}

export interface TimeCustomerService {
  list(
    ctx: ServiceRequestContext,
    query?: ListQuery,
  ): Promise<PageResult<TimeCustomer>>;
  get(ctx: ServiceRequestContext, customerId: TimeCustomerId): Promise<TimeCustomer>;
  create(
    ctx: ServiceRequestContext,
    input: CreateTimeCustomerInput,
  ): Promise<TimeCustomer>;
  update(
    ctx: ServiceRequestContext,
    customerId: TimeCustomerId,
    input: UpdateTimeCustomerInput,
  ): Promise<TimeCustomer>;
  archive(
    ctx: ServiceRequestContext,
    customerId: TimeCustomerId,
  ): Promise<TimeCustomer>;
}
