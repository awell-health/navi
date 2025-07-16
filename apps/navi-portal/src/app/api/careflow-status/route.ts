import { sessionStore } from "@/lib/session-store";
import { SessionData } from "@awell-health/navi-core";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const careflowId = request.nextUrl.searchParams.get("careflow_id");
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const instanceId = request.nextUrl.searchParams.get("instance_id");

  if (!careflowId || !sessionId) {
    return new Response("Missing careflow_id or session_id", { status: 400 });
  }
  const sessionData = await sessionStore.get(sessionId);
  if (!sessionData) {
    return new Response("Session not found", { status: 404 });
  }
  console.log("GET /api/careflow-status", {
    careflowId,
    sessionId,
    sessionData,
  });

  // Create SSE response
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection confirmation
      const send = (data: Record<string, string | number | SessionData>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({
        type: "connection",
        message: "Connected to care flow status stream",
        careflowId,
        sessionData,
        timestamp: Date.now(),
      });

      // Simulate care flow preparation progress
      let progress = 0;
      const progressSteps = [
        { progress: 20, message: "Validating care flow access..." },
        { progress: 40, message: "Loading patient context..." },
        { progress: 60, message: "Preparing activities..." },
        { progress: 80, message: "Applying branding..." },
        { progress: 100, message: "Ready! Redirecting..." },
      ];

      const sendProgress = () => {
        if (progress < progressSteps.length) {
          const step = progressSteps[progress];
          send({
            type: "progress",
            progress: step.progress,
            message: step.message,
            careflowId,
            sessionData,
            timestamp: Date.now(),
          });
          progress++;

          if (progress < progressSteps.length) {
            setTimeout(sendProgress, 200 + Math.random() * 300); // 200-500ms intervals
          } else {
            // Send completion event
            setTimeout(() => {
              // Build redirectUrl with instanceId if available
              let redirectUrl = `/careflows/${careflowId}/stakeholders/${sessionData.stakeholderId}`;
              if (instanceId) {
                redirectUrl += `?instance_id=${instanceId}`;
              }

              send({
                type: "ready",
                message: "Care flow ready for navigation",
                careflowId,
                redirectUrl,
                sessionData,
                timestamp: Date.now(),
              });
            }, 300);
          }
        }
      };

      // Start progress simulation after brief delay
      setTimeout(sendProgress, 100);

      // Clean up on client disconnect
      request.signal.addEventListener("abort", () => {
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
