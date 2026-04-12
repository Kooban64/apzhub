"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { getClientSession, postClientLogout } from "@/lib/api/auth-client";
import type { SessionCredentialState } from "@/lib/auth/session-credential-state";
import { anonymousSessionSnapshot, type SessionSnapshot } from "@/lib/auth/session-types";

type SessionContextValue = {
  snapshot: SessionSnapshot;
  credential: SessionCredentialState;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot>(() => anonymousSessionSnapshot());
  const [credential, setCredential] = useState<SessionCredentialState>("none");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const expiryHandled = useRef(false);

  const refresh = useCallback(async () => {
    const env = await getClientSession();
    setSnapshot(env.snapshot);
    setCredential(env.credential);
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- bootstrap session snapshot from /api/auth/session on mount */
    void refresh().finally(() => {
      queueMicrotask(() => setLoading(false));
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [refresh]);

  useEffect(() => {
    if (snapshot.sessionStatus === "active") {
      expiryHandled.current = false;
    }
  }, [snapshot.sessionStatus]);

  useEffect(() => {
    if (!loading && snapshot.sessionStatus === "expired" && !expiryHandled.current) {
      expiryHandled.current = true;
      void (async () => {
        await postClientLogout();
        setSnapshot(anonymousSessionSnapshot());
        setCredential("none");
        router.replace("/login?reason=expired");
      })();
    }
  }, [loading, router, snapshot.sessionStatus]);

  const signOut = useCallback(async () => {
    await postClientLogout();
    setSnapshot(anonymousSessionSnapshot());
    setCredential("none");
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      snapshot,
      credential,
      loading,
      refresh,
      signOut,
    }),
    [credential, loading, refresh, signOut, snapshot],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
