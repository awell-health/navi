import React from "react";
import { type SmartSessionData, consumeSmartTicket } from "@/domains/smart";
import { SmartHomeTabs } from "./components/smart-home-tabs";
import { MedplumClientProvider } from "@/domains/medplum/MedplumClientProvider";
import { fetchPatient } from "@/domains/smart/ehr";
import { PatientIdentifier } from "@awell-health/navi-core";
import { Bootstrap } from "@/app/demo/_components/Bootstrap";
import { env } from "@/env";
import { initializeStatsig, Statsig } from "@/lib/statsig.edge";
import { Patient } from "@medplum/fhirtypes";
import { getTestPatient } from "./TestPatient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession(
  ticket?: string | null
): Promise<SmartSessionData | null> {
  if (!ticket) return null;
  return await consumeSmartTicket(ticket);
}

export default async function SmartHomePage({
  searchParams,
}: {
  searchParams: Promise<{
    ticket?: string;
    testPatient?: string;
  }>;
}) {
  const sp = await searchParams;
  const [session] = await Promise.all([
    getSession(sp?.ticket ?? null),
    initializeStatsig().catch((e) =>
      console.error("Error initializing Statsig", e)
    ),
  ]);

  if (!session && !sp?.testPatient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            No SMART Session Found
          </h1>
          <p className="text-gray-600">
            Please start from your EHR&apos;s SMART app launcher.
          </p>
        </div>
      </div>
    );
  }
  console.log("session", session);

  let httpOnly = false;
  let patient: Patient | null = null;
  let patientIdentifier: PatientIdentifier | null = null;

  if (session) {
    patientIdentifier = {
      system: session.iss,
      value: session.patient ?? "",
    };
    if (session.scope?.includes("patient/*.read")) {
      patient = await fetchPatient(
        session.iss,
        session.accessToken,
        session.patient
      );
    }
    httpOnly = Statsig.checkGateSync(
      {
        userID: session.fhirUser,
        customIDs: {
          org_id: session.iss,
        },
      },
      "http_only_cookies"
    );
  } else if (sp?.testPatient) {
    patient = getTestPatient();
    patientIdentifier = {
      system: "https://launch.smarthealthit.org/v/r4/fhir",
      value: patient.id!,
    };
  }
  console.log("httpOnly", httpOnly);
  console.log("cookie domain", env.HTTP_COOKIE_DOMAIN);
  console.log("patient", patient);
  console.log("patientIdentifier", patientIdentifier);
  if (!patientIdentifier) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Patient or Patient Identifier Not Found
          </h1>
          <p className="text-gray-600">
            Unable to load patient information from the EHR.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MedplumClientProvider>
      <div className="w-[550px] min-w-[550px] max-w-[550px] mx-auto">
        {sp?.testPatient && (
          <SmartHomeTabs
            patient={patient}
            patientIdentifier={patientIdentifier}
          />
        )}
        {session && (
          <Bootstrap
            stytchPublicToken={env.STYTCH_B2B_PUBLIC_TOKEN}
            cookieDomain={env.HTTP_COOKIE_DOMAIN}
            useHttpOnly={httpOnly}
          >
            <SmartHomeTabs
              patient={patient}
              patientIdentifier={patientIdentifier}
            />
          </Bootstrap>
        )}
      </div>
    </MedplumClientProvider>
  );
}
