import React from "react";
import { type SmartSessionData, consumeSmartTicket } from "@/domains/smart";
import { SmartHomeTabs } from "./components/smart-home-tabs";
import { MedplumClientProvider } from "@/domains/medplum/MedplumClientProvider";
import { fetchPatient } from "@/domains/smart/ehr";
import { PatientIdentifier } from "@awell-health/navi-core";
import { User } from "lucide-react";
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

  let httpOnly = false;
  let patient: Patient | null = null;
  let patientIdentifier: PatientIdentifier | null = null;

  if (session) {
    patient = await fetchPatient(
      session.iss,
      session.accessToken,
      session.patient
    );
    httpOnly = Statsig.checkGateSync(
      {
        userID: session.fhirUser,
        customIDs: {
          org_id: session.iss,
        },
      },
      "http_only_cookies"
    );
    patientIdentifier = {
      system: session.iss,
      value: session.patient ?? "",
    };
  } else if (sp?.testPatient) {
    patient = getTestPatient();
    patientIdentifier = {
      system: "https://launch.smarthealthit.org/v/r4/fhir",
      value: patient.id ?? "",
    };
  }
  if (!patient || !patientIdentifier) {
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

  const patientName =
    patient.name?.[0]?.text ??
    ([...(patient.name?.[0]?.given ?? [])].join(" ")
      ? `${[...(patient.name?.[0]?.given ?? [])].join(" ")} ${
          patient.name?.[0]?.family ?? ""
        }`.trim()
      : "Unknown Patient");

  console.log("httpOnly", httpOnly, "cookie domain", env.HTTP_COOKIE_DOMAIN);

  return (
    <MedplumClientProvider>
      <div className="bg-white min-h-screen w-[550px] min-w-[550px] max-w-[550px] mx-auto">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 mr-2" /> {patientName}{" "}
            <span className="text-sm text-gray-500 mt-1 font-medium">
              ({patient.id})
            </span>
          </div>
        </div>

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
      </div>
    </MedplumClientProvider>
  );
}
