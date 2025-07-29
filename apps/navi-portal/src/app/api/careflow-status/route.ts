import { sessionStore } from "@/lib/session-store";
import { SessionData } from "@awell-health/navi-core";
import { NextRequest } from "next/server";
import { patientMatch, startCareflow } from "@/lib/api/mutations";

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
      const send = (data: Record<string, any>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({
        type: "connection",
        message: "Connected to care flow status stream",
        careflowId,
        sessionData,
        timestamp: Date.now(),
      });

      // Execute real care flow operations
      const executeOperations = async () => {
        try {
          // Step 1: Patient matching
          send({
            type: "progress",
            progress: 20,
            message: "Matching patient identity...",
            careflowId,
            sessionData,
            timestamp: Date.now(),
          });

          const patientResult = await patientMatch(
            {
              patient_id: sessionData.patientId,
              allow_anonymous_creation: true,
            },
            sessionData
          );

          send({
            type: "progress",
            progress: 40,
            message: "Patient matched successfully",
            careflowId,
            sessionData,
            timestamp: Date.now(),
          });

          // Step 2: Start care flow
          send({
            type: "progress",
            progress: 60,
            message: "Starting care flow...",
            careflowId,
            sessionData,
            timestamp: Date.now(),
          });

          const careflowResult = await startCareflow(
            {
              patient_id: patientResult.patient_id!,
              careflow_definition_id: careflowId,
              stakeholder_id: sessionData.stakeholderId,
              session_id: sessionId,
            },
            sessionData
          );

          send({
            type: "progress",
            progress: 80,
            message: "Care flow started, preparing interface...",
            careflowId,
            sessionData,
            timestamp: Date.now(),
          });

          // Step 3: Final preparation
          setTimeout(() => {
            send({
              type: "progress",
              progress: 100,
              message: "Ready! Redirecting...",
              careflowId,
              sessionData,
              timestamp: Date.now(),
            });

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
                careflowData: {
                  id: careflowResult.careflow.id,
                  release_id: careflowResult.careflow.release_id,
                  stakeholder_count: careflowResult.stakeholders?.length || 0,
                },
                timestamp: Date.now(),
              });
            }, 300);
          }, 500);
        } catch (error) {
          console.error("❌ Care flow operation failed:", error);
          send({
            type: "error",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
            careflowId,
            sessionData,
            timestamp: Date.now(),
          });
        }
      };

      // Start operations
      executeOperations();

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
