"use client";

import { useState, useEffect } from "react";
import { type SmartSessionData } from "@/domains/smart";
import { useMedplum } from "@/domains/medplum/MedplumClientProvider";
import { PatientIdentifier } from "@awell-health/navi-core";
import type { Task } from "@medplum/fhirtypes";

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

interface UsePatientTasksResult {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
}

export function usePatientTasks(
  session: SmartSessionData,
  patient: PatientResource
): UsePatientTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getPatientByIdentifier, getTasksForPatient } = useMedplum();

  useEffect(() => {
    async function fetchTasks() {
      if (!session.patient || !session.iss) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const patientIdentifier: PatientIdentifier = {
          system: session.iss,
          value: session.patient,
        };

        const medplumPatient = await getPatientByIdentifier(patientIdentifier);
        if (!medplumPatient?.id) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const medplumTasks = await getTasksForPatient(medplumPatient.id);

        setTasks(medplumTasks);
      } catch (err) {
        console.error("Error fetching patient tasks:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch tasks")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [
    session.patient,
    session.iss,
    getPatientByIdentifier,
    getTasksForPatient,
  ]);

  return { tasks, loading, error };
}
