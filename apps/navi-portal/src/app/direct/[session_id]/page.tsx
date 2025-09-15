import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import type {
  ActiveSessionTokenData,
  EmbedSessionData,
} from "@awell-health/navi-core";
import { AuthService } from "@awell-health/navi-core";
import { env } from "@/env";
import DirectSessionClient from "./DirectSessionClient";
import { SessionProvider } from "@/lib/session-provider";
import { SessionService } from "@/domains/session/service";

type Params = Promise<{ session_id: string }>;

export const dynamic = "force-dynamic";

export default async function DirectSessionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { session_switched?: string };
}) {
  const { session_id: sessionId } = await params;

  // URL is source of truth: if cookies reference a different session, surface notification only
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("awell.jwt");
    if (jwtCookie?.value && searchParams.session_switched !== "1") {
      const auth = new AuthService();
      await auth.initialize(env.JWT_SIGNING_KEY);
      const payload = await auth.verifyToken(jwtCookie.value);
      console.log("🔑 JWT cookie found with verified payload", payload);
      const jwtSessionId = payload.sub as string | undefined;
      if (jwtSessionId && jwtSessionId !== sessionId) {
        console.warn("🔑 JWT session ID mismatch. JWT session ID:", jwtSessionId, "URL session ID:", sessionId);
        // Today the URL is the source of truth. Append notification param for client log.
        redirect(`/direct/${sessionId}?session_switched=1`);
      }
    }
  } catch {
    // Ignore and continue with requested session
  }
  const session = await SessionService.get(sessionId);
  console.log("🔑 Session", session);
  if (!session) {
    notFound();
  }

  // If session is already active, go straight to activities
  if ("state" in session && session.state === "active") {
    const active = session as ActiveSessionTokenData;
    if (active.careflowId && active.stakeholderId) {
      redirect(
        `/careflows/${active.careflowId}/stakeholders/${active.stakeholderId}`
      );
    }
  }

  // If session is in error, render a simple error page
  if ("state" in session && session.state === "error") {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-2">
            Unable to load session
          </h1>
          <p className="text-muted-foreground">
            {"errorMessage" in session && session.errorMessage
              ? session.errorMessage
              : "An unknown error occurred. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  // Session in created/preparation state or missing careflowId: use SSE to progress and then redirect
  const embedFields = "state" in session ? (session as EmbedSessionData) : null;
  const careflowDefinitionId = embedFields?.careflowDefinitionId;

  return (
    <SessionProvider initialSessionIdFromUrl={sessionId}>
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <h1 className="text-xl font-semibold">Preparing your experience</h1>
            <p className="text-muted-foreground">
              We’re getting things ready. This should only take a moment.
            </p>
          </div>
          <DirectSessionClient
            sessionId={sessionId}
            careflowDefinitionId={careflowDefinitionId}
          />
        </div>
      </div>
    </SessionProvider>
  );
}
