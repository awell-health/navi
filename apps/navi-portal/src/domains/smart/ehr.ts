"use server";

import { Patient, Practitioner, Encounter } from "@medplum/fhirtypes";

export async function fetchPatient(
  iss: string,
  accessToken: string,
  patientId?: string
): Promise<Patient | null> {
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
  return (await res.json()) as Patient;
}

export async function fetchProvider(
  iss: string,
  accessToken: string,
  fhirUser?: string
): Promise<Practitioner | null> {
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
  return (await res.json()) as Practitioner;
}

export async function fetchEncounter(
  iss: string,
  accessToken: string,
  encounter?: string
): Promise<Encounter | null> {
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
  return (await res.json()) as Encounter;
}

function resolveRefUrl(iss: string, ref: string): string {
  if (/^https?:\/\//i.test(ref)) return ref;
  const base = iss.replace(/\/$/, "");
  const path = ref.replace(/^\//, "");
  return `${base}/${path}`;
}
