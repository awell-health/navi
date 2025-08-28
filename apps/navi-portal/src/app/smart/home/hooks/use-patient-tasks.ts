"use client";

import { useState, useEffect } from "react";
import { type SmartSessionData } from "@/domains/smart";
import { type ActivityFragment } from "@/lib/awell-client/generated/graphql";
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
  tasks: ActivityFragment[];
  loading: boolean;
  error: Error | null;
}

export function usePatientTasks(
  session: SmartSessionData,
  patient: PatientResource
): UsePatientTasksResult {
  const [tasks, setTasks] = useState<ActivityFragment[]>([]);
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
        
        const convertedTasks: ActivityFragment[] = medplumTasks.map((task: Task) => ({
          id: task.id || `task-${Date.now()}-${Math.random()}`,
          date: task.authoredOn || new Date().toISOString(),
          status: mapTaskStatus(task.status),
          action: "ACTIVATE" as const,
          object: {
            id: task.id || "unknown",
            type: "FORM" as const,
            name: task.description || task.code?.text || "Unnamed Task",
          },
          indirect_object: task.requester?.display ? {
            id: task.requester.reference || "unknown",
            type: "STAKEHOLDER" as const,
            name: task.requester.display,
          } : undefined,
          is_user_activity: true,
          reference_id: task.identifier?.[0]?.value || task.id || "unknown",
          reference_type: "ORCHESTRATION" as const,
          careflow_id: "medplum-task",
          pathway_definition_id: "medplum-pathway",
          tenant_id: "medplum",
          sub_activities: [],
          resolution: task.status === "completed" ? null : undefined,
        }));

        setTasks(convertedTasks);
      } catch (err) {
        console.error("Error fetching patient tasks:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch tasks"));
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [session.patient, session.iss, getPatientByIdentifier, getTasksForPatient]);

  return { tasks, loading, error };
}

function mapTaskStatus(fhirStatus?: string): "ACTIVE" | "DONE" | "FAILED" {
  switch (fhirStatus) {
    case "completed":
      return "DONE";
    case "failed":
    case "cancelled":
      return "FAILED";
    case "draft":
    case "requested":
    case "received":
    case "accepted":
    case "ready":
    case "in-progress":
    default:
      return "ACTIVE";
  }
}
