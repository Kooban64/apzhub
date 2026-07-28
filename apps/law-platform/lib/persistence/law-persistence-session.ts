import {
  createLawPersistenceContext,
  type LawPersistenceContext,
} from "./law-persistence-context";

/**
 * Client-safe session persistence binding (APZHUB-ENG-0007 / RG-LAW-DNS).
 * Must not import node:async_hooks or @apzhub/config db (pg).
 */

let sessionPersistenceContext: LawPersistenceContext | undefined;

export function setSessionLawPersistenceContext(
  context: LawPersistenceContext | undefined,
): void {
  sessionPersistenceContext = context;
}

export function getSessionLawPersistenceContext(): LawPersistenceContext | undefined {
  return sessionPersistenceContext;
}

export function resetLawPersistenceSession(): void {
  sessionPersistenceContext = undefined;
}

export function getOrCreateSessionLawPersistenceContext(): LawPersistenceContext {
  return sessionPersistenceContext ?? createLawPersistenceContext();
}
