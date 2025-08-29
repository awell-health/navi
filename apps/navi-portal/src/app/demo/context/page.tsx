import { type SmartSessionData, consumeSmartTicket } from "@/domains/smart";

import { SampleComponent } from "../_components/SampleComponent";
import { getStatsig, initializeStatsig } from "@/lib/statsig.client";
import {
  fetchEncounter,
  fetchPatient,
  fetchProvider,
} from "@/domains/smart/ehr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession(
  ticket?: string | null
): Promise<SmartSessionData | null> {
  if (!ticket) return null;
  return await consumeSmartTicket(ticket);
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    ticket?: string;
    stytchSession?: string;
  }>;
}) {
  const sp = await searchParams;
  const session = await getSession(sp?.ticket ?? null);
  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h1>SMART Demo</h1>
        <p>No session found. Start from /smart/launch</p>
      </div>
    );
  }

  const [patient, provider, encounter] = await Promise.all([
    fetchPatient(session.iss, session.accessToken, session.patient),
    fetchProvider(session.iss, session.accessToken, session.fhirUser),
    fetchEncounter(session.iss, session.accessToken, session.encounter),
  ]);
  if (!provider) {
    return (
      <div style={{ padding: 24 }}>
        <h1>No recognized clinician</h1>
        <p>
          When launching this application, the clinician must be recognizable
          and a clinician email must be included in the provider resource
          returned by the EHR.
        </p>
      </div>
    );
  }

  if (!session.idToken) {
    return (
      <div>
        <h1>missing id token</h1>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    );
  }
  await initializeStatsig({
    userID: session.fhirUser,
  });
  getStatsig().logEvent("smart_launch_success");
  console.log("provider", provider, "patient", patient);

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: "450px",
        margin: "0 auto",
      }}
    >
      <SampleComponent />
      <h1>SMART Context</h1>
      <pre
        style={{
          background: "#111",
          color: "#eee",
          padding: 16,
          borderRadius: 8,
          fontSize: "12px",
          marginBottom: 24,
        }}
      >
        {JSON.stringify(
          {
            iss: session.iss,
            patient: session.patient,
            encounter: session.encounter,
            fhirUser: session.fhirUser,
            scope: session.scope,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
