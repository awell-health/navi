"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ProgressEvent = {
  type: "progress";
  progress?: number;
  message?: string;
};

type ReadyEvent = {
  type: "ready";
  redirectUrl?: string;
};

type ErrorEvent = {
  type: "error";
  message?: string;
};

type StatusEvent = ProgressEvent | ReadyEvent | ErrorEvent;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStatusEvent(value: unknown): value is StatusEvent {
  if (!isObject(value)) return false;
  const t = value.type;
  return t === "progress" || t === "ready" || t === "error";
}

export interface UseCareflowStatusOptions {
  sessionId: string;
  careflowDefinitionId?: string;
  instanceId?: string | null;
  sessionSwitched?: boolean;
  onReady?: (redirectUrl: string) => void;
}

export interface UseCareflowStatusState {
  progress: number;
  message: string;
  error: string | null;
  reconnect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

/**
 * Establishes an SSE connection to `/api/careflow-status` for a given session
 * and exposes progress, message, and error state. Invokes onReady callback
 * when a redirectUrl is provided by the server.
 */
export function useCareflowStatus(
  options: UseCareflowStatusOptions
): UseCareflowStatusState {
  const { sessionId, careflowDefinitionId, instanceId, sessionSwitched, onReady } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("Starting...");
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const disconnect = useCallback(() => {
    const es = eventSourceRef.current;
    if (es) {
      try {
        es.close();
      } catch {
        // ignore
      } finally {
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);

    const params = new URLSearchParams();
    params.set("session_id", sessionId);
    if (instanceId) params.set("instance_id", instanceId);
    if (sessionSwitched) params.set("session_switched", "1");
    if (careflowDefinitionId) params.set("careflow_definition_id", careflowDefinitionId);

    const sseUrl = `/api/careflow-status?${params.toString()}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;
    setIsConnected(true);

    es.onmessage = (evt: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(evt.data) as unknown;
        if (!isStatusEvent(parsed)) return;

        if (parsed.type === "progress") {
          if (typeof parsed.progress === "number") setProgress(parsed.progress);
          if (typeof parsed.message === "string") setMessage(parsed.message);
        } else if (parsed.type === "ready" && typeof parsed.redirectUrl === "string") {
          disconnect();
          if (onReady) onReady(parsed.redirectUrl);
        } else if (parsed.type === "error") {
          setError(parsed.message || "An error occurred.");
        }
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      setError("Connection lost. Please refresh the page.");
      disconnect();
    };
  }, [sessionId, instanceId, sessionSwitched, careflowDefinitionId, onReady, disconnect]);

  // Establish connection on mount and when key inputs change
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  return { progress, message, error, reconnect, disconnect, isConnected };
}


