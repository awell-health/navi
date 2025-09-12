"use server";

import { cache } from "react";
import { env } from "@/env";
import { MedplumClient } from "@medplum/core";
import { MedplumStoreClient } from "./medplum-client";
import type { Patient, Task, MedicationStatement, Medication } from "@medplum/fhirtypes";
// import { requireStytchSession } from "@/domains/smart/stytch";
import { PatientIdentifier } from "@awell-health/navi-core";

const getServerMedplum = cache(async (): Promise<MedplumStoreClient> => {
  const baseUrl = env.NEXT_PUBLIC_MEDPLUM_BASE_URL;
  const clientId = env.MEDPLUM_CLIENT_ID;
  const clientSecret = env.MEDPLUM_CLIENT_SECRET;

  if (!baseUrl) throw new Error("Medplum base URL not configured");
  if (!clientId || !clientSecret)
    throw new Error("Medplum server credentials not configured");

  const client = new MedplumClient({ baseUrl });
  const store = new MedplumStoreClient(client);
  await store.initialize(clientId, clientSecret);
  console.log("Medplum initialized");
  return store;
});

export async function fetchPatientAction(
  patientId: string
): Promise<Patient | null> {
  // await requireStytchSession();
  console.log("fetchPatientAction", patientId);
  const medplum = await getServerMedplum();
  const resp = await medplum.getPatient(patientId);
  console.log("Fetched Medplum Patient", resp);
  return resp;
}

export async function fetchPatientTasksAction(
  patientId: string
): Promise<Task[]> {
  // await requireStytchSession();
  console.log("fetchPatientTasksAction", patientId);
  const medplum = await getServerMedplum();
  const resp = await medplum.getTasksForPatient(patientId);
  console.log(
    "Fetched Medplum Tasks with IDs:",
    resp.map((t) => t.id)
  );
  return resp;
}

export async function fetchPatientByIdentifierAction(
  identifier: PatientIdentifier
): Promise<Patient | null> {
  // await requireStytchSession();
  console.log("fetchPatientByIdentifierAction", identifier);
  const medplum = await getServerMedplum();
  const resp = await medplum.getPatientByIdentifier(identifier);
  console.log("Fetched Medplum Patient by Identifier", resp);
  return resp;
}

export async function fetchPatientMedicationsAction(
  patientId: string
): Promise<{
  medicationStatements: MedicationStatement[];
  medications: Medication[];
}> {
  // await requireStytchSession();
  console.log("fetchPatientMedicationsAction", patientId);
  const medplum = await getServerMedplum();
  const resp = await medplum.getMedicationsForPatient(patientId);
  console.log(
    "Fetched Medplum MedicationStatements with IDs:",
    resp.medicationStatements.map((m) => m.id)
  );
  console.log(
    "Fetched Medplum Medications with IDs:",
    resp.medications.map((m) => m.id)
  );
  return resp;
}

export async function updateTaskStatusAction(
  taskId: string,
  status: Task["status"]
): Promise<Task> {
  // await requireStytchSession();
  console.log("updateTaskStatusAction", taskId, status);
  const medplum = await getServerMedplum();
  const resp = await medplum.updateTaskStatus(taskId, status);
  console.log("Updated Medplum Task", resp.id, "to status", status);
  return resp;
}
