"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCareflowStatus } from "@/hooks/use-careflow-status";

export default function DirectSessionClient({
  sessionId,
  careflowDefinitionId,
}: {
  sessionId: string;
  careflowDefinitionId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { progress, message, error } = useCareflowStatus({
    sessionId,
    careflowDefinitionId,
    instanceId: searchParams.get("instance_id"),
    sessionSwitched: searchParams.get("session_switched") === "1",
    onReady: (redirectUrl) => router.replace(redirectUrl),
  });

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
