"use client";
import { Typography } from "@/components/ui";
import { getStatsig } from "@/lib/statsig";
import { initializeStatsig } from "@/lib/statsig";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const sp = useSearchParams();
  const code = sp.get("code") ?? "unknown_error";
  const message =
    sp.get("message") ?? "An unexpected error occurred during SMART launch.";
  const status = sp.get("status");
  const iss = sp.get("iss");
  initializeStatsig().then(() => {
    getStatsig().logEvent({
      eventName: "smart_launch_error",
      metadata: {
        code,
      },
    });
  });
  return (
    <div className="flex flex-col gap-4 p-4">
      <Typography.H1>SMART Launch Error</Typography.H1>
      <Typography.P>
        Something went wrong while connecting to the EHR. Please try again.
      </Typography.P>
      <pre className="bg-primary/10 px-2 py-1 rounded font-mono">
        {JSON.stringify(
          {
            code,
            status,
            message,
            iss,
          },
          null,
          2
        )}
      </pre>
      <Typography.P>
        If this persists, contact support with the error details above.
      </Typography.P>
    </div>
  );
}
