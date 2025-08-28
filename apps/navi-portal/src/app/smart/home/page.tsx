import React from "react";
import { type SmartSessionData, consumeSmartTicket } from "@/domains/smart";
import { TaskList } from "./components/task-list";
import { MedplumClientProvider } from "@/domains/medplum/MedplumClientProvider";
import {
  fetchEncounter,
  fetchPatient,
  fetchProvider,
} from "@/domains/smart/ehr";
import { PatientIdentifier } from "@awell-health/navi-core";

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
  }>;
}) {
  const sp = await searchParams;
  const session = await getSession(sp?.ticket ?? null);
  
  if (!session) {
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

  const [patient, provider, encounter] = await Promise.all([
    fetchPatient(session.iss, session.accessToken, session.patient),
    fetchProvider(session.iss, session.accessToken, session.fhirUser),
    fetchEncounter(session.iss, session.accessToken, session.encounter),
  ]);

  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Patient Not Found
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

  const patientIdentifier: PatientIdentifier = {
    system: session.iss,
    value: session.patient ?? "",
  };

  return (
    <MedplumClientProvider>
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Tasks for {patientName}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Patient ID: {patient.id}
          </p>
        </div>
        
        <div className="p-4">
          <TaskList 
            session={session}
            patient={patient}
            patientIdentifier={patientIdentifier}
          />
        </div>
      </div>
    </MedplumClientProvider>
  );
}
