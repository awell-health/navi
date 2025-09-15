"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type SessionStatus = "initializing" | "ready" | "missing" | "expired" | "error";

type SessionContextValue = {
  sessionId: string | null;
  status: SessionStatus;
  sessionSwitched: boolean;
  sessionDetails: Record<string, unknown> | null;
  initializeFromUrl: (sessionId: string) => Promise<void>;
  refreshSessionTtl: () => Promise<void>;
  clearSession: (opts?: { clearJwt?: boolean }) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export type SessionProviderProps = {
  children: React.ReactNode;
  initialSessionIdFromUrl?: string;
  enableFocusRefresh?: boolean;
  heartbeatMs?: number; // default 24h
  onSessionSwitch?: (prevId: string | null, nextId: string) => void;
};

export function SessionProvider({
  children,
  initialSessionIdFromUrl,
  enableFocusRefresh = true,
  heartbeatMs = 24 * 60 * 60 * 1000,
  onSessionSwitch,
}: SessionProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>("initializing");
  const [sessionSwitched, setSessionSwitched] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<Record<string, unknown> | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  const initializeFromUrl = useCallback(async (incoming: string) => {
    setStatus("initializing");
    // Ask server to set HttpOnly cookies for this session id
    try {
      const url = `/api/session/initialize?session_id=${encodeURIComponent(incoming)}`;
      const resp = await fetch(url, { credentials: "include" });
      if (!resp.ok) {
        setStatus(resp.status === 401 ? "expired" : "error");
        return;
      }
    } catch {
      // ignore network errors; we'll still try to confirm via JWT
    }

    const previous = sessionId;
    // Confirm via details endpoint (single source of truth)
    try {
      const detailsResp = await fetch(`/api/session/details`, { credentials: "include" });
      if (detailsResp.ok) {
        const data = (await detailsResp.json()) as { sessionId?: string; session?: Record<string, unknown> };
        const confirmed = data.sessionId ?? incoming;
        if (confirmed && confirmed !== previous) {
          setSessionSwitched(Boolean(previous) && confirmed !== previous);
          onSessionSwitch?.(previous ?? null, confirmed);
        }
        setSessionId(confirmed ?? null);
        setSessionDetails(data.session ?? null);
        setStatus("ready");
        return;
      }
      // Non-OK response
      setSessionId(incoming);
      setSessionDetails(null);
      setStatus(detailsResp.status === 401 ? "missing" : detailsResp.status === 404 ? "expired" : "error");
    } catch {
      setSessionId(incoming);
      setSessionDetails(null);
      setStatus("error");
    }
  }, [onSessionSwitch, sessionId]);

  const refreshSessionTtl = useCallback(async () => {
    try {
      await fetch("/api/session/refresh", { method: "POST", credentials: "include" });
    } catch {
      // best effort
    }
  }, []);

  const clearSession = useCallback(async (opts?: { clearJwt?: boolean }) => {
    try {
      if (opts?.clearJwt) {
        await fetch("/api/session/clear-jwt", { credentials: "include" });
      } else {
        await fetch("/api/session/logout", { method: "POST", credentials: "include" });
      }
    } finally {
      setSessionId(null);
      setStatus("missing");
      setSessionSwitched(false);
      try {
        localStorage.setItem("navi:session:logout", String(Date.now()));
      } catch {}
    }
  }, []);

  // Boot sequence
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (initialSessionIdFromUrl) {
        await initializeFromUrl(initialSessionIdFromUrl);
        if (cancelled) return;
        setStatus("ready");
        return;
      }

      try {
        const detailsResp = await fetch(`/api/session/details`, { credentials: "include" });
        if (cancelled) return;
        if (detailsResp.ok) {
          const data = (await detailsResp.json()) as { sessionId?: string; session?: Record<string, unknown> };
          setSessionId(data.sessionId ?? null);
          setSessionDetails(data.session ?? null);
          setStatus("ready");
        } else {
          setSessionId(null);
          setSessionDetails(null);
          setStatus(detailsResp.status === 401 ? "missing" : detailsResp.status === 404 ? "expired" : "error");
        }
      } catch {
        if (cancelled) return;
        setSessionId(null);
        setSessionDetails(null);
        setStatus("error");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [initializeFromUrl, initialSessionIdFromUrl]);

  // Focus refresh
  useEffect(() => {
    if (!enableFocusRefresh) return;
    const onFocus = () => {
      void refreshSessionTtl();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enableFocusRefresh, refreshSessionTtl]);

  // Heartbeat refresh
  useEffect(() => {
    if (!heartbeatMs || heartbeatMs <= 0) return;
    heartbeatRef.current = window.setInterval(() => {
      void refreshSessionTtl();
    }, heartbeatMs);
    return () => {
      if (heartbeatRef.current) {
        window.clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [heartbeatMs, refreshSessionTtl]);

  // Cross-tab logout listener
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "navi:session:logout") {
        setSessionId(null);
        setStatus("missing");
        setSessionSwitched(false);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    sessionId,
    status,
    sessionSwitched,
    sessionDetails,
    initializeFromUrl,
    refreshSessionTtl,
    clearSession,
  }), [sessionId, status, sessionSwitched, sessionDetails, initializeFromUrl, refreshSessionTtl, clearSession]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}


