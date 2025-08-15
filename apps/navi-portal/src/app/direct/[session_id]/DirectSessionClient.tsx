"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DirectSessionClient({
  sessionId,
  careflowDefinitionId,
}: {
  sessionId: string;
  careflowDefinitionId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("Starting...");
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // If the server switched sessions to honor an existing valid JWT, notify via console
    if (searchParams.get("session_switched") === "1") {
      // eslint-disable-next-line no-console
      console.warn(
        "[Navi] Using existing session from JWT; switched sessions to keep you signed in."
      );
    }

    // Ensure server sets HttpOnly cookies before establishing SSE
    const initialize = async () => {
      try {
        const initUrl = `/api/session/initialize?session_id=${encodeURIComponent(
          sessionId
        )}`;
        await fetch(initUrl, { credentials: "include" });
      } catch {
        // non-fatal; SSE may still work if cookies already present
      }
    };

    initialize();

    const params = new URLSearchParams();
    params.set("session_id", sessionId);
    const instanceId = searchParams.get("instance_id");
    if (instanceId) params.set("instance_id", instanceId);
    const switched = searchParams.get("session_switched");
    if (switched === "1") params.set("session_switched", "1");
    if (careflowDefinitionId) {
      params.set("careflow_definition_id", careflowDefinitionId);
    }

    const sseUrl = `/api/careflow-status?${params.toString()}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === "progress") {
          if (typeof data.progress === "number") setProgress(data.progress);
          if (data.message) setMessage(data.message);
        } else if (data.type === "ready" && data.redirectUrl) {
          es.close();
          router.replace(data.redirectUrl);
        }
      } catch (e) {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      setError("Connection lost. Please refresh the page.");
      try {
        es.close();
      } catch {}
    };

    return () => {
      try {
        es.close();
      } catch {}
    };
  }, [sessionId, careflowDefinitionId, router, searchParams]);

  if (error) {
    return (
      <div className="border rounded-md p-4 text-center">
        <p className="text-destructive mb-2">{error}</p>
        <button
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={() => router.refresh()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-6">
      <div className="mb-2 text-sm text-muted-foreground">{message}</div>
      <div className="w-full h-2 bg-muted rounded">
        <div
          className="h-2 bg-primary rounded"
          style={{ width: `${progress}%`, transition: "width 300ms ease" }}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{progress}%</div>
    </div>
  );
}
