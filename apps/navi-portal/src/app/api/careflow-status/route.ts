import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const careflowId = request.nextUrl.searchParams.get("careflow_id");
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!careflowId || !sessionId) {
    return new Response("Missing careflow_id or session_id", { status: 400 });
  }

  // Create SSE response
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection confirmation
      const send = (data: Record<string, string | number>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({
        type: "connection",
        message: "Connected to care flow status stream",
        careflowId,
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
            timestamp: Date.now(),
          });
          progress++;

          if (progress < progressSteps.length) {
            setTimeout(sendProgress, 200 + Math.random() * 300); // 200-500ms intervals
          } else {
            // Send completion event
            setTimeout(() => {
              send({
                type: "ready",
                message: "Care flow ready for navigation",
                careflowId,
                redirectUrl: `/careflows/${careflowId}/stakeholders/${sessionId}`,
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
