import { TaskList } from "@/components/tasks/task-list";
import { MedplumClientProvider } from "@/domains/medplum/MedplumClientProvider";
import {
  fetchEncounter,
  fetchPatient,
  fetchProvider,
} from "@/domains/smart/ehr";
import { consumeSmartTicket } from "@/domains/smart/store";
import { PatientIdentifier } from "@awell-health/navi-core";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; ticket?: string }>;
}) {
  const sp = await searchParams;
  const patientId = sp?.patientId;
  const session = await consumeSmartTicket(sp?.ticket);
  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h1>SMART Demo</h1>
        <p>No session found. Start from /smart/launch</p>
      </div>
    );
  }

  const [patient, provider, encounter] = await Promise.all([
    fetchPatient(session.iss, session.accessToken, session.patient),
    fetchProvider(session.iss, session.accessToken, session.fhirUser),
    fetchEncounter(session.iss, session.accessToken, session.encounter),
  ]);

  const patientIdentifier: PatientIdentifier = {
    system: session.iss,
    value: session.patient ?? "",
  };

  return (
    <MedplumClientProvider>
      <TaskList patientIdentifier={patientIdentifier} />
    </MedplumClientProvider>
  );
}
