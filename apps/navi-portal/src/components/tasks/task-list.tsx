"use client";
import { useEffect, useState } from "react";
import { useMedplum } from "@/domains/medplum/MedplumClientProvider";
import { Task } from "@medplum/fhirtypes";
import { PatientIdentifier } from "@awell-health/navi-core";
import { getStatsig, initializeStatsig } from "@/lib/statsig";

export const TaskList = ({
  patientIdentifier,
}: {
  patientIdentifier?: PatientIdentifier;
}) => {
  const { getTasksForPatient, getPatientByIdentifier, isLoading, error } =
    useMedplum();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!patientIdentifier || isLoading) return;
    let active = true;
    getPatientByIdentifier(patientIdentifier)
      .then(async (p) => {
        console.log("Patient fetched from medplum", p);
        return p?.id;
      })
      .then((id?: string) => {
        if (!id) return;
        getTasksForPatient(id)
          .then((t) => {
            console.log("Tasks fetched", t);
            if (active) setTasks(t);
            return id;
          })
          .then(async (id) => {
            await initializeStatsig({
              userID: id,
            });
            getStatsig().logEvent("Medplum patient loaded");
          })
          .catch((e) => {
            console.error("Error fetching tasks", e);
            if (active)
              setLoadError(e instanceof Error ? e : new Error("Failed"));
          });
      })
      .catch((e) => {
        console.error("Error fetching patient", e);
        if (active) setLoadError(e instanceof Error ? e : new Error("Failed"));
      });
    return () => {
      active = false;
    };
  }, [patientIdentifier, isLoading, getTasksForPatient]);

  if (!patientIdentifier) return <pre>Missing patientIdentifier</pre>;
  if (error) return <pre>{error.message}</pre>;
  if (loadError) return <pre>{loadError.message}</pre>;
  if (isLoading || !tasks) return <pre>Loading...</pre>;
  return <pre>{JSON.stringify(tasks, null, 2)}</pre>;
};
