import { type SmartSessionData, consumeSmartTicket } from "@/domains/smart";

import { SampleComponent } from "../_components/SampleComponent";
import { PatientTaskList } from "../_components/PatientTaskList";
import { MedplumClientProvider } from "@/domains/medplum/MedplumClientProvider";
import { getStatsig, initializeStatsig } from "@/lib/statsig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession(
  ticket?: string | null
): Promise<SmartSessionData | null> {
  if (!ticket) return null;
  return await consumeSmartTicket(ticket);
}

type HumanName = {
  text?: string;
  given?: string[];
  family?: string;
};

type PatientResource = {
  id?: string;
  name?: HumanName[];
  gender?: string;
  birthDate?: string;
};

type PractitionerResource = {
  resourceType?: "Practitioner" | string;
  id?: string;
  name?: HumanName[];
};

type EncounterResource = {
  resourceType?: "Encounter" | string;
  id?: string;
  status?: string;
  class?: { system?: string; code?: string; display?: string };
  period?: { start?: string; end?: string };
};

async function fetchPatient(
  iss: string,
  accessToken: string,
  patientId?: string
): Promise<PatientResource | null> {
  if (!patientId) return null;
  const url = `${iss.replace(/\/$/, "")}/Patient/${encodeURIComponent(
    patientId
  )}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as PatientResource;
}

function resolveRefUrl(iss: string, ref: string): string {
  if (/^https?:\/\//i.test(ref)) return ref;
  const base = iss.replace(/\/$/, "");
  const path = ref.replace(/^\//, "");
  return `${base}/${path}`;
}

async function fetchProvider(
  iss: string,
  accessToken: string,
  fhirUser?: string
): Promise<PractitionerResource | null> {
  if (!fhirUser) return null;
  const url = resolveRefUrl(iss, fhirUser);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as PractitionerResource;
}

async function fetchEncounter(
  iss: string,
  accessToken: string,
  encounter?: string
): Promise<EncounterResource | null> {
  if (!encounter) return null;
  const ref = /\//.test(encounter) ? encounter : `Encounter/${encounter}`;
  const url = resolveRefUrl(iss, ref);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as EncounterResource;
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

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif", maxWidth: "450px", margin: "0 auto" }}>
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
      
      <MedplumClientProvider>
        <PatientTaskList patientId={session.patient} />
      </MedplumClientProvider>
    </div>
  );
}
