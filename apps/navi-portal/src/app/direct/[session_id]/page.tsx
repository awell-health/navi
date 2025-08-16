import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import type {
  ActiveSessionTokenData,
  EmbedSessionData,
} from "@awell-health/navi-core";
import { AuthService } from "@awell-health/navi-core";
import { env } from "@/env";
import DirectSessionClient from "./DirectSessionClient";
import { SessionService } from "@/domains/session/service";

type Params = Promise<{ session_id: string }>;

export const dynamic = "force-dynamic";

export default async function DirectSessionPage({
  params,
}: {
  params: Params;
}) {
  const { session_id: sessionId } = await params;

  // URL is source of truth: if cookies reference a different session, surface notification only
  try {
    const cookieStore = await cookies();
    const jwtCookie = cookieStore.get("awell.jwt");
    if (jwtCookie?.value) {
      const auth = new AuthService();
      await auth.initialize(env.JWT_SIGNING_KEY);
      const payload = await auth.verifyToken(jwtCookie.value);
      const jwtSessionId = payload.sub as string | undefined;
      if (jwtSessionId && jwtSessionId !== sessionId) {
        // Do not redirect; the URL wins. Append notification param for client log.
        redirect(`/direct/${sessionId}?session_switched=1`);
      }
    }
  } catch {
    // Ignore and continue with requested session
  }
  const session = await SessionService.get(sessionId);
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
  );
}
