import type { DatabaseExecutor } from "@apzhub/config";

import type { LawPersistenceContext } from "./law-persistence-context";
import { applyPostgresTenantSession } from "./postgres-tenant-session";

export interface LawUnitOfWork {
  readonly db: DatabaseExecutor;
  readonly context: LawPersistenceContext;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

/** Client aggregate transaction boundary (LAW-012-02/03). */
export class ClientUnitOfWork implements LawUnitOfWork {
  private committed = false;
  private rolledBack = false;

  constructor(
    readonly db: DatabaseExecutor,
    readonly context: LawPersistenceContext,
    private readonly release: () => void,
  ) {}

  async commit(): Promise<void> {
    this.committed = true;
    this.release();
  }

  async rollback(): Promise<void> {
    this.rolledBack = true;
    this.release();
  }

  get isSettled(): boolean {
    return this.committed || this.rolledBack;
  }
}

/** Matter aggregate transaction boundary (LAW-012-02/03). */
export class MatterUnitOfWork implements LawUnitOfWork {
  private committed = false;
  private rolledBack = false;

  constructor(
    readonly db: DatabaseExecutor,
    readonly context: LawPersistenceContext,
    private readonly release: () => void,
  ) {}

  async commit(): Promise<void> {
    this.committed = true;
    this.release();
  }

  async rollback(): Promise<void> {
    this.rolledBack = true;
    this.release();
  }

  get isSettled(): boolean {
    return this.committed || this.rolledBack;
  }
}

/** Task aggregate transaction boundary (LAW-012-04). */
export class TaskUnitOfWork implements LawUnitOfWork {
  private committed = false;
  private rolledBack = false;

  constructor(
    readonly db: DatabaseExecutor,
    readonly context: LawPersistenceContext,
    private readonly release: () => void,
  ) {}

  async commit(): Promise<void> {
    this.committed = true;
    this.release();
  }

  async rollback(): Promise<void> {
    this.rolledBack = true;
    this.release();
  }

  get isSettled(): boolean {
    return this.committed || this.rolledBack;
  }
}

/** Document aggregate transaction boundary (LAW-012-04). */
export class DocumentUnitOfWork implements LawUnitOfWork {
  private committed = false;
  private rolledBack = false;

  constructor(
    readonly db: DatabaseExecutor,
    readonly context: LawPersistenceContext,
    private readonly release: () => void,
  ) {}

  async commit(): Promise<void> {
    this.committed = true;
    this.release();
  }

  async rollback(): Promise<void> {
    this.rolledBack = true;
    this.release();
  }

  get isSettled(): boolean {
    return this.committed || this.rolledBack;
  }
}

/** Calendar event aggregate transaction boundary (LAW-012-05). */
export class CalendarEventUnitOfWork implements LawUnitOfWork {
  private committed = false;
  private rolledBack = false;

  constructor(
    readonly db: DatabaseExecutor,
    readonly context: LawPersistenceContext,
    private readonly release: () => void,
  ) {}

  async commit(): Promise<void> {
    this.committed = true;
    this.release();
  }

  async rollback(): Promise<void> {
    this.rolledBack = true;
    this.release();
  }

  get isSettled(): boolean {
    return this.committed || this.rolledBack;
  }
}

/** Time entry aggregate transaction boundary (LAW-012-05). */
export class TimeEntryUnitOfWork implements LawUnitOfWork {
  private committed = false;
  private rolledBack = false;

  constructor(
    readonly db: DatabaseExecutor,
    readonly context: LawPersistenceContext,
    private readonly release: () => void,
  ) {}

  async commit(): Promise<void> {
    this.committed = true;
    this.release();
  }

  async rollback(): Promise<void> {
    this.rolledBack = true;
    this.release();
  }

  get isSettled(): boolean {
    return this.committed || this.rolledBack;
  }
}

/** Invoice aggregate transaction boundary (LAW-012-06). */
export class InvoiceUnitOfWork implements LawUnitOfWork {
  private committed = false;
  private rolledBack = false;

  constructor(
    readonly db: DatabaseExecutor,
    readonly context: LawPersistenceContext,
    private readonly release: () => void,
  ) {}

  async commit(): Promise<void> {
    this.committed = true;
    this.release();
  }

  async rollback(): Promise<void> {
    this.rolledBack = true;
    this.release();
  }

  get isSettled(): boolean {
    return this.committed || this.rolledBack;
  }
}

export async function runInClientUnitOfWork<T>(
  db: DatabaseExecutor,
  context: LawPersistenceContext,
  operation: (uow: ClientUnitOfWork) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applyPostgresTenantSession(tx, context);

    let settled = false;
    const uow = new ClientUnitOfWork(tx, context, () => {
      settled = true;
    });

    try {
      const result = await operation(uow);
      if (!settled) {
        await uow.commit();
      }
      return result;
    } catch (error) {
      if (!settled) {
        await uow.rollback();
      }
      throw error;
    }
  });
}

export async function runInMatterUnitOfWork<T>(
  db: DatabaseExecutor,
  context: LawPersistenceContext,
  operation: (uow: MatterUnitOfWork) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applyPostgresTenantSession(tx, context);

    let settled = false;
    const uow = new MatterUnitOfWork(tx, context, () => {
      settled = true;
    });

    try {
      const result = await operation(uow);
      if (!settled) {
        await uow.commit();
      }
      return result;
    } catch (error) {
      if (!settled) {
        await uow.rollback();
      }
      throw error;
    }
  });
}

export async function runInDocumentUnitOfWork<T>(
  db: DatabaseExecutor,
  context: LawPersistenceContext,
  operation: (uow: DocumentUnitOfWork) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applyPostgresTenantSession(tx, context);

    let settled = false;
    const uow = new DocumentUnitOfWork(tx, context, () => {
      settled = true;
    });

    try {
      const result = await operation(uow);
      if (!settled) {
        await uow.commit();
      }
      return result;
    } catch (error) {
      if (!settled) {
        await uow.rollback();
      }
      throw error;
    }
  });
}

export async function runInTaskUnitOfWork<T>(
  db: DatabaseExecutor,
  context: LawPersistenceContext,
  operation: (uow: TaskUnitOfWork) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applyPostgresTenantSession(tx, context);

    let settled = false;
    const uow = new TaskUnitOfWork(tx, context, () => {
      settled = true;
    });

    try {
      const result = await operation(uow);
      if (!settled) {
        await uow.commit();
      }
      return result;
    } catch (error) {
      if (!settled) {
        await uow.rollback();
      }
      throw error;
    }
  });
}

export async function runInCalendarEventUnitOfWork<T>(
  db: DatabaseExecutor,
  context: LawPersistenceContext,
  operation: (uow: CalendarEventUnitOfWork) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applyPostgresTenantSession(tx, context);

    let settled = false;
    const uow = new CalendarEventUnitOfWork(tx, context, () => {
      settled = true;
    });

    try {
      const result = await operation(uow);
      if (!settled) {
        await uow.commit();
      }
      return result;
    } catch (error) {
      if (!settled) {
        await uow.rollback();
      }
      throw error;
    }
  });
}

export async function runInTimeEntryUnitOfWork<T>(
  db: DatabaseExecutor,
  context: LawPersistenceContext,
  operation: (uow: TimeEntryUnitOfWork) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applyPostgresTenantSession(tx, context);

    let settled = false;
    const uow = new TimeEntryUnitOfWork(tx, context, () => {
      settled = true;
    });

    try {
      const result = await operation(uow);
      if (!settled) {
        await uow.commit();
      }
      return result;
    } catch (error) {
      if (!settled) {
        await uow.rollback();
      }
      throw error;
    }
  });
}

export async function runInInvoiceUnitOfWork<T>(
  db: DatabaseExecutor,
  context: LawPersistenceContext,
  operation: (uow: InvoiceUnitOfWork) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await applyPostgresTenantSession(tx, context);

    let settled = false;
    const uow = new InvoiceUnitOfWork(tx, context, () => {
      settled = true;
    });

    try {
      const result = await operation(uow);
      if (!settled) {
        await uow.commit();
      }
      return result;
    } catch (error) {
      if (!settled) {
        await uow.rollback();
      }
      throw error;
    }
  });
}
