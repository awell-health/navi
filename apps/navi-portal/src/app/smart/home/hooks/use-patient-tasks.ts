"use client";

import { useState, useEffect } from "react";
import { type SmartSessionData } from "@/domains/smart";
import { type ActivityFragment } from "@/lib/awell-client/generated/graphql";

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

  useEffect(() => {
    async function fetchTasks() {
      if (!session.patient || !patient.id) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const mockTasks: ActivityFragment[] = [
          {
            id: "task-1",
            date: new Date().toISOString(),
            status: "ACTIVE" as const,
            action: "ACTIVATE" as const,
            object: {
              id: "obj-1",
              type: "FORM" as const,
              name: "Patient Health Questionnaire",
            },
            indirect_object: {
              id: "stakeholder-1",
              type: "STAKEHOLDER" as const,
              name: "Dr. Sarah Johnson",
            },
            is_user_activity: true,
            reference_id: "PHQ-9-001",
            reference_type: "ORCHESTRATION" as const,
            careflow_id: "cf-001",
            pathway_definition_id: "pd-001",
            tenant_id: "tenant-001",
            sub_activities: [],
          },
          {
            id: "task-2",
            date: new Date(Date.now() - 86400000).toISOString(),
            status: "DONE" as const,
            action: "COMPLETE" as const,
            object: {
              id: "obj-2",
              type: "MESSAGE" as const,
              name: "Medication Review",
            },
            indirect_object: {
              id: "stakeholder-2",
              type: "STAKEHOLDER" as const,
              name: "Nurse Mary Wilson",
            },
            is_user_activity: true,
            reference_id: "MED-REV-002",
            reference_type: "ORCHESTRATION" as const,
            careflow_id: "cf-001",
            pathway_definition_id: "pd-001",
            tenant_id: "tenant-001",
            sub_activities: [],
            resolution: null,
          },
          {
            id: "task-3",
            date: new Date(Date.now() - 172800000).toISOString(),
            status: "ACTIVE" as const,
            action: "ASSIGNED" as const,
            object: {
              id: "obj-3",
              type: "CHECKLIST" as const,
              name: "Pre-Surgery Checklist",
            },
            is_user_activity: true,
            reference_id: "PRE-SURG-003",
            reference_type: "ORCHESTRATION" as const,
            careflow_id: "cf-002",
            pathway_definition_id: "pd-002",
            tenant_id: "tenant-001",
            sub_activities: [],
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 500));
        setTasks(mockTasks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch tasks"));
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [session.patient, patient.id]);

  return { tasks, loading, error };
}
