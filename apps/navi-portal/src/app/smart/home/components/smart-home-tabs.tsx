"use client";

import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { TaskList } from "./task-list";
import { MedicationsList } from "./medications-list";
import { PatientIdentifier } from "@awell-health/navi-core";
import { ReusableTabs } from "./reusable-tabs";
import {
  Coding,
  Extension,
  Identifier,
  Patient,
  Task,
} from "@medplum/fhirtypes";
import { TaskView } from "./task-view";
import { InfoCard } from "./info-card";
import { useMedplum } from "@/domains/medplum/MedplumClientProvider";

type PatientResource = {
  id?: string;
  name?: Array<{
    text?: string;
    given?: string[];
    family?: string;
  }>;
  gender?: string;
  birthDate?: string;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  maritalStatus?: {
    text?: string;
  };
  identifier?: Array<{
    type?: {
      text?: string;
    };
    system?: string;
    value?: string;
  }>;
};

interface SmartHomeTabsProps {
  patient: PatientResource | null;
  patientIdentifier: PatientIdentifier;
  medplumPatient?: Patient | null;
}

export function SmartHomeTabs({
  patient: initialPatient,
  patientIdentifier,
  medplumPatient,
}: SmartHomeTabsProps) {
  const [patient, setPatient] = useState<PatientResource | null>(
    initialPatient
  );
  const [activeTab, setActiveTab] = React.useState("context");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const { getPatientByIdentifier } = useMedplum();

  useEffect(() => {
    if (patient === null) {
      getPatientByIdentifier(patientIdentifier).then((p) => {
        setPatient(p);
      });
    }
  }, [getPatientByIdentifier, patientIdentifier, patient]);

  // Helper function to format patient name
  const getPatientName = () => {
    if (patient?.name?.[0]?.text) {
      return patient.name[0].text;
    }

    const given = patient?.name?.[0]?.given?.join(" ") || "";
    const family = patient?.name?.[0]?.family || "";

    return (
      [given, family].filter(Boolean).join(" ").trim() || "Unknown Patient"
    );
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // {
  //   "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
  //   "code": "MPI",
  //   "display": "Master Patient Index"
  // }
  // Helper function to get identifiers count
  const renderMPIIdentifierValue = (identifiers: Identifier[]) => {
    const mpiIdentifier = identifiers.find((item) => {
      return item.type?.coding?.find((coding: Coding) => coding.code === "MPI");
    });
    if (!mpiIdentifier) return null;

    return <span className="text-gray-900">{mpiIdentifier.value}</span>;
  };

  const tabs = [
    { id: "context", label: "Context" },
    { id: "tasks", label: "Tasks" },
  ];

  const awellExtension = medplumPatient?.extension?.find(
    (ext: Extension) =>
      ext.url ===
      "https://awellhealth.com/fhir/StructureDefinition/awell-data-points"
  );

  let programVbc;
  let programDiseaseStage;
  let programSite;

  if (awellExtension) {
    const { extension } = awellExtension as Extension;
    programVbc =
      extension?.find((ext) => ext.url === "programVbc")?.valueString || "-";
    programDiseaseStage =
      extension?.find((ext) => ext.url === "programDiseaseStage")
        ?.valueString || "-";
    programSite =
      extension?.find((ext) => ext.url === "programSite")?.valueString || "-";
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Separate Header - Context Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 mb-4 border-l border-r">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">{getPatientName()}</span>
          <span>•</span>
          <span>ID {patient?.id || "unknown"}</span>
        </div>
      </div>

      {banner && (
        <div className="px-6 mb-4">
          <div className="rounded-md border border-green-200 bg-green-50 text-green-800 shadow-sm px-4 py-3">
            <p className="font-medium">{banner}</p>
          </div>
        </div>
      )}

      {!selectedTask && (
        <ReusableTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        >
          {/* Context Tab Content */}
          <div
            className={`space-y-4 ${
              activeTab === "context" ? "block" : "hidden"
            }`}
          >
            {/* Patient Details Box - Non-collapsible */}
            <InfoCard
              title="Patient Details & Demographics"
              items={[
                {
                  label: "Full Name",
                  value: getPatientName(),
                },
                {
                  label: "Date of Birth",
                  value: formatDate(patient?.birthDate),
                },
                {
                  label: "MPI",
                  value:
                    patient?.identifier?.length &&
                    patient?.identifier?.length > 0
                      ? renderMPIIdentifierValue(patient?.identifier)
                      : patient?.identifier?.[0]?.value || "-",
                },
                {
                  label: "Program VBC",
                  value: programVbc,
                },
                {
                  label: "Program Disease Stage",
                  value: programDiseaseStage,
                },
                {
                  label: "Program Site",
                  value: programSite,
                },
              ]}
            />

            {/* Medications Card */}
            <div className="border border-gray-200 rounded-lg bg-white p-4">
              <MedicationsList patientIdentifier={patientIdentifier} />
            </div>
          </div>

          {/* Tasks Tab Content */}
          <div className={activeTab === "tasks" ? "block" : "hidden"}>
            <TaskList
              patientIdentifier={patientIdentifier}
              setSelectedTask={setSelectedTask}
            />
          </div>
        </ReusableTabs>
      )}

      {selectedTask && (
        <TaskView
          task={selectedTask}
          onBack={() => {
            setSelectedTask(null);
            setBanner(null);
          }}
        />
      )}
    </div>
  );
}
