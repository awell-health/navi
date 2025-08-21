import {
  decryptObject,
  type SmartPreAuth,
  type SmartSessionData,
} from "@/lib/smart";
import { env } from "@/env";
import { redirect } from "next/navigation";
import { consumeSmartTicket } from "@/domains/smart/store";

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
  searchParams: Promise<{ ticket?: string; code?: string; state?: string }>;
}) {
  const sp = await searchParams;
  // Fallback: if redirected here directly by the OAuth server, complete the exchange inline
  if (sp?.code && sp?.state) {
    try {
      const pre = await decryptObject<SmartPreAuth>(sp.state);
      const { resolveClientId } = await import("@/lib/smart/handlers");
      const clientId = await resolveClientId(pre.iss);
      const body = new URLSearchParams();
      body.set("grant_type", "authorization_code");
      body.set("code", sp.code);
      body.set("redirect_uri", env.SMART_REDIRECT_URI ?? "");
      body.set("client_id", clientId ?? "");
      body.set("code_verifier", pre.codeVerifier);

      const tokenRes = await fetch(pre.tokenEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body,
        cache: "no-store",
      });

      if (tokenRes.ok) {
        const tokenJson = (await tokenRes.json()) as {
          access_token: string;
          token_type?: string;
          scope?: string;
          expires_in?: number;
          id_token?: string;
          patient?: string;
          encounter?: string;
          fhirUser?: string;
        };

        const sessionData: SmartSessionData = {
          sid: crypto.randomUUID(),
          iss: pre.iss,
          tokenEndpoint: pre.tokenEndpoint,
          accessToken: tokenJson.access_token,
          idToken: tokenJson.id_token,
          scope: tokenJson.scope,
          patient: tokenJson.patient,
          encounter: tokenJson.encounter,
          fhirUser: tokenJson.fhirUser,
          expiresIn: tokenJson.expires_in,
          tokenType: tokenJson.token_type,
        };

        const { createSmartTicket } = await import("@/domains/smart/store");
        const ticket = await createSmartTicket(sessionData, 120);
        redirect(`/demo/context?ticket=${encodeURIComponent(ticket)}`);
        return null as never;
      }
    } catch {
      // fall through to "no session" UI
    }
  }

  const session = await getSession(sp?.ticket ?? null);
  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h1>SMART Demo</h1>
        <p>No session found. Start from /smart/launch</p>
      </div>
    );
  }

  const patient = await fetchPatient(
    session.iss,
    session.accessToken,
    session.patient
  );
  const provider = await fetchProvider(
    session.iss,
    session.accessToken,
    session.fhirUser
  );
  const encounter = await fetchEncounter(
    session.iss,
    session.accessToken,
    session.encounter
  );

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>SMART Context</h1>
      <pre
        style={{
          background: "#111",
          color: "#eee",
          padding: 16,
          borderRadius: 8,
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
      <h2>Patient</h2>
      {patient ? (
        <pre
          style={{
            background: "#111",
            color: "#eee",
            padding: 16,
            borderRadius: 8,
          }}
        >
          {JSON.stringify(
            {
              id: patient.id,
              name:
                patient.name?.[0]?.text ??
                ([...(patient.name?.[0]?.given ?? [])].join(" ")
                  ? `${[...(patient.name?.[0]?.given ?? [])].join(" ")} ${
                      patient.name?.[0]?.family ?? ""
                    }`.trim()
                  : undefined),
              gender: patient.gender,
              birthDate: patient.birthDate,
            },
            null,
            2
          )}
        </pre>
      ) : (
        <p>Patient not available or fetch failed.</p>
      )}

      <h2>Provider</h2>
      {provider ? (
        <pre
          style={{
            background: "#111",
            color: "#eee",
            padding: 16,
            borderRadius: 8,
          }}
        >
          {JSON.stringify(
            {
              id: provider.id,
              resourceType: provider.resourceType,
              name:
                provider.name?.[0]?.text ??
                ([...(provider.name?.[0]?.given ?? [])].join(" ")
                  ? `${[...(provider.name?.[0]?.given ?? [])].join(" ")} ${
                      provider.name?.[0]?.family ?? ""
                    }`.trim()
                  : undefined),
            },
            null,
            2
          )}
        </pre>
      ) : (
        <p>No provider info.</p>
      )}

      <h2>Encounter</h2>
      {encounter ? (
        <pre
          style={{
            background: "#111",
            color: "#eee",
            padding: 16,
            borderRadius: 8,
          }}
        >
          {JSON.stringify(
            {
              id: encounter.id,
              status: encounter.status,
              class: encounter.class?.display ?? encounter.class?.code,
              period: encounter.period,
            },
            null,
            2
          )}
        </pre>
      ) : (
        <p>No encounter info.</p>
      )}
    </div>
  );
}
