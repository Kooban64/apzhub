import { describe, expect, it } from "vitest";

import {
  createDurableDeliveryStoreForTest,
  createDurableNotificationRuntimeBootstrap,
} from "./durable-runtime-bootstrap";
import {
  isNotificationDeliveryEnabled,
  isNotificationDurableRuntimeEnabled,
} from "./delivery-env";

describe("ENG-001B durable runtime foundation (P0/P1)", () => {
  it("defaults APZHUB_NOTIFICATION_DURABLE_RUNTIME to OFF", () => {
    expect(isNotificationDurableRuntimeEnabled({})).toBe(false);
    expect(
      isNotificationDurableRuntimeEnabled({ APZHUB_NOTIFICATION_DURABLE_RUNTIME: "" }),
    ).toBe(false);
    expect(
      isNotificationDurableRuntimeEnabled({
        APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false",
      }),
    ).toBe(false);
  });

  it("recognises truthy durable runtime flag without changing delivery default", () => {
    expect(
      isNotificationDurableRuntimeEnabled({
        APZHUB_NOTIFICATION_DURABLE_RUNTIME: "true",
      }),
    ).toBe(true);
    expect(
      isNotificationDeliveryEnabled({ APZHUB_NOTIFICATION_DURABLE_RUNTIME: "true" }),
    ).toBe(false);
  });

  it("bootstrap stays process_local with null store when flag OFF", () => {
    const boot = createDurableNotificationRuntimeBootstrap({
      APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false",
    });
    expect(boot.durableRuntimeFlagEnabled).toBe(false);
    expect(boot.mode).toBe("process_local");
    expect(boot.store).toBeNull();
    expect(boot.durableWorker).toBeNull();
  });

  it("flag OFF ignores explicit store (repository remains unused)", () => {
    const store = createDurableDeliveryStoreForTest();
    const boot = createDurableNotificationRuntimeBootstrap({
      env: { APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false" },
      store,
    });
    expect(boot.store).toBeNull();
    expect(boot.mode).toBe("process_local");
  });

  it("flag ON may attach explicit store for DI; mode is postgresql_durable", () => {
    const store = createDurableDeliveryStoreForTest();
    const boot = createDurableNotificationRuntimeBootstrap({
      env: { APZHUB_NOTIFICATION_DURABLE_RUNTIME: "true" },
      store,
    });
    expect(boot.durableRuntimeFlagEnabled).toBe(true);
    expect(boot.mode).toBe("postgresql_durable");
    expect(boot.store?.kind).toBe("memory_durable");
  });
});
