// Tiny in-memory session store. NOT for production — swap for Redis/DB.
import { randomUUID } from "node:crypto";
import type { OidcAuthorizationRequest } from "@valyd/sdk";

export interface AppSession {
  id: string;
  user: unknown;
  verifications?: unknown;
  accessToken: string;
  refreshToken?: string;
  createdAt: number;
  // Populated when the demo runs a verification workflow (below).
  verifySessionId?: string;
  verifyResult?: unknown;
}

const store = new Map<string, AppSession>();
const loginStore = new Map<string, { transaction: OidcAuthorizationRequest; expiresAt: number }>();

export const sessions = {
  createLogin(transaction: OidcAuthorizationRequest): string {
    const id = randomUUID();
    loginStore.set(id, { transaction, expiresAt: Date.now() + 10 * 60 * 1000 });
    return id;
  },
  consumeLogin(id: string | undefined): OidcAuthorizationRequest | undefined {
    if (!id) return undefined;
    const entry = loginStore.get(id);
    loginStore.delete(id);
    return entry && entry.expiresAt > Date.now() ? entry.transaction : undefined;
  },
  destroyLogin(id: string | undefined) {
    if (id) loginStore.delete(id);
  },
  create(data: Omit<AppSession, "id" | "createdAt">): AppSession {
    const session: AppSession = { id: randomUUID(), createdAt: Date.now(), ...data };
    store.set(session.id, session);
    return session;
  },
  get(id: string | undefined): AppSession | undefined {
    if (!id) return undefined;
    return store.get(id);
  },
  destroy(id: string | undefined) {
    if (id) store.delete(id);
  },
};
