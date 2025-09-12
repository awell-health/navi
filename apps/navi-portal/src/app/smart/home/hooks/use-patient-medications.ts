"use client";

import { useState, useEffect } from "react";
import { useMedplum } from "@/domains/medplum/MedplumClientProvider";
import { PatientIdentifier } from "@awell-health/navi-core";
import type { MedicationStatement, Medication } from "@medplum/fhirtypes";

type PatientResource = {
  id?: string;
  name?: Array<{
    text?: string;
    given?: string[];
    family?: string;
  }>;
  gender?: string;
  birthDate?: string;
};

interface UsePatientMedicationsResult {
  medicationStatements: MedicationStatement[];
  medications: Medication[];
  loading: boolean;
  error: Error | null;
  refetchMedications: () => void;
}

export function usePatientMedications(
  patientIdentifier: PatientIdentifier
): UsePatientMedicationsResult {
  const [medicationStatements, setMedicationStatements] = useState<MedicationStatement[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getPatientByIdentifier, getMedicationsForPatient } = useMedplum();

  async function fetchMedications() {
    if (!patientIdentifier.value || !patientIdentifier.system) {
      setMedicationStatements([]);
      setMedications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const medplumPatient = await getPatientByIdentifier(patientIdentifier);
      if (!medplumPatient?.id) {
        setMedicationStatements([]);
        setMedications([]);
        setLoading(false);
        return;
      }

      const result = await getMedicationsForPatient(medplumPatient.id);
      setMedicationStatements(result.medicationStatements);
      setMedications(result.medications);
    } catch (err) {
      console.error("Error fetching patient medications:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch medications")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMedications();
  }, [patientIdentifier]);

  const refetchMedications = () => {
    fetchMedications();
  };

  return { medicationStatements, medications, loading, error, refetchMedications };
}
