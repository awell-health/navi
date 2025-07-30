import { sessionStore } from "@/lib/session-store";
import { NextRequest } from "next/server";
import { patientMatch, startCareflow } from "@/lib/api/mutations";
import {
  EmbedSessionData,
  ActiveSessionTokenData,
  SessionData,
} from "@awell-health/navi-core";

export const runtime = "edge";

interface ProgressMessage {
  type: "progress" | "ready" | "connection";
  progress?: number;
  message?: string;
  redirectUrl?: string;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const careflowDefinitionId = request.nextUrl.searchParams.get(
    "careflow_definition_id"
  );
  const instanceId = request.nextUrl.searchParams.get("instance_id");

  if (!sessionId) {
    return new Response("Missing session_id", { status: 400 });
  }

  const originalSession = await sessionStore.get(sessionId);
  if (!originalSession) {
    return new Response("Session not found", { status: 404 });
  }

  // Create SSE response
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: ProgressMessage) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({
        type: "connection",
        message: "Connected to care flow status",
        timestamp: Date.now(),
      });

      if (careflowDefinitionId) {
        createNewCareflow({
          sessionId,
          careflowDefinitionId,
          instanceId,
          originalSession,
          send,
          controller,
        });
      } else {
        // Existing careflow - just redirect
        setTimeout(() => {
          let redirectUrl = `/careflows/${originalSession.careflowId}/stakeholders/${originalSession.stakeholderId}`;
          if (instanceId) {
            redirectUrl += `?instance_id=${instanceId}`;
          }
          send({
            type: "ready",
            redirectUrl,
            timestamp: Date.now(),
          });
          controller.close();
        }, 500);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function createNewCareflow({
  sessionId,
  careflowDefinitionId,
  instanceId,
  originalSession,
  send,
  controller,
}: {
  sessionId: string;
  careflowDefinitionId: string;
  instanceId: string | null;
  originalSession: SessionData | EmbedSessionData | ActiveSessionTokenData;
  send: (data: ProgressMessage) => void;
  controller: ReadableStreamDefaultController;
}) {
  try {
    // Step 1: Patient matching
    send({
      type: "progress",
      progress: 20,
      message: "Matching patient identity...",
      timestamp: Date.now(),
    });

    const embedFields = "state" in originalSession ? originalSession : null;
    const patientResult = await patientMatch(
      {
        patient_id: originalSession.patientId,
        patient_identifier: embedFields?.patientIdentifier,
        allow_anonymous_creation: true,
      },
      originalSession as SessionData
    );

    send({
      type: "progress",
      progress: 40,
      message: "Patient matched successfully",
      timestamp: Date.now(),
    });

    // Step 2: Start careflow
    send({
      type: "progress",
      progress: 60,
      message: "Starting care flow...",
      timestamp: Date.now(),
    });

    const patientId = patientResult.patient_id;
    if (!patientId) {
      throw new Error("Patient matching failed");
    }

    const stakeholderId = originalSession.stakeholderId || patientId;
    const careflowResult = await startCareflow(
      {
        patient_id: patientId,
        careflow_definition_id: careflowDefinitionId,
        stakeholder_id: stakeholderId,
        session_id: sessionId,
      },
      originalSession as SessionData
    );

    send({
      type: "progress",
      progress: 80,
      message: "Care flow started, preparing interface...",
      timestamp: Date.now(),
    });

    // Step 3: Update session to active state
    const careflowId = careflowResult.careflow.id;
    const activeSession: ActiveSessionTokenData = {
      sessionId,
      orgId: originalSession.orgId,
      tenantId: originalSession.tenantId,
      environment: originalSession.environment,
      authenticationState: originalSession.authenticationState,
      exp: originalSession.exp,
      state: "active",
      patientId,
      careflowId,
      stakeholderId,
      careflowData: {
        id: careflowId,
        release_id: careflowResult.careflow.release_id,
      },
      // Include embed-specific fields if they exist
      careflowDefinitionId: embedFields?.careflowDefinitionId,
      patientIdentifier: embedFields?.patientIdentifier,
      track_id: embedFields?.track_id,
      activity_id: embedFields?.activity_id,
      stakeholder_id: embedFields?.stakeholder_id,
    };

    await sessionStore.set(sessionId, activeSession);

    // Step 4: Complete
    setTimeout(() => {
      send({
        type: "progress",
        progress: 100,
        message: "Ready! Redirecting...",
        timestamp: Date.now(),
      });

      setTimeout(() => {
        let redirectUrl = `/careflows/${careflowId}/stakeholders/${stakeholderId}`;
        if (instanceId) {
          redirectUrl += `?instance_id=${instanceId}`;
        }
        send({
          type: "ready",
          redirectUrl,
          timestamp: Date.now(),
        });
        controller.close();
      }, 500);
    }, 1000);

    console.log("✅ Careflow created successfully", {
      sessionId,
      patientId,
      careflowId,
      stakeholderId,
    });
  } catch (error) {
    console.error("❌ Error creating careflow:", error);

    // Set session to error state
    const errorSession: EmbedSessionData = {
      sessionId,
      orgId: originalSession.orgId,
      tenantId: originalSession.tenantId,
      environment: originalSession.environment,
      authenticationState: originalSession.authenticationState,
      exp: originalSession.exp,
      state: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      patientId: originalSession.patientId,
      careflowId: originalSession.careflowId,
      stakeholderId: originalSession.stakeholderId,
    };

    await sessionStore.set(sessionId, errorSession);
    controller.close();
  }
}
