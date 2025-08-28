"use server";

import { cache } from "react";
import { env } from "@/env";
import { MedplumClient } from "@medplum/core";
import { MedplumStoreClient } from "./medplum-client";
import type { Patient, Task } from "@medplum/fhirtypes";
import { requireStytchSession } from "@/domains/smart/stytch";
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
  return store;
});

export async function fetchPatientAction(
  patientId: string
): Promise<Patient | null> {
  await requireStytchSession();
  const medplum = await getServerMedplum();
  return medplum.getPatient(patientId);
}

export async function fetchPatientTasksAction(
  patientId: string
): Promise<Task[]> {
  await requireStytchSession();
  const medplum = await getServerMedplum();
  return medplum.getTasksForPatient(patientId);
}

export async function fetchPatientByIdentifierAction(
  identifier: PatientIdentifier
): Promise<Patient | null> {
  await requireStytchSession();
  const medplum = await getServerMedplum();
  return medplum.getPatientByIdentifier(identifier);
}
