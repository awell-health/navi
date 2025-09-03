"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { TaskList } from "./task-list";
import { PatientIdentifier } from "@awell-health/navi-core";
import { ReusableTabs } from "./reusable-tabs";
import { Coding, Identifier, Task } from "@medplum/fhirtypes";
import { TaskView } from "./task-view";
import { InfoCard } from "./info-card";

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
  patient: PatientResource;
  patientIdentifier: PatientIdentifier;
}

export function SmartHomeTabs({
  patient,
  patientIdentifier,
}: SmartHomeTabsProps) {
  const [activeTab, setActiveTab] = React.useState("context");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Helper function to format patient name
  const getPatientName = () => {
    if (patient.name?.[0]?.text) {
      return patient.name[0].text;
    }

    const given = patient.name?.[0]?.given?.join(" ") || "";
    const family = patient.name?.[0]?.family || "";

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

  console.log("patient", patient);

  return (
    <div className="bg-white min-h-screen">
      {/* Separate Header - Context Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 mb-4 border-l border-r">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">{getPatientName()}</span>
          <span>•</span>
          <span>ID {patient.id || "unknown"}</span>
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
                  label: "MPI",
                  value:
                    patient.identifier?.length && patient.identifier?.length > 0
                      ? renderMPIIdentifierValue(patient.identifier)
                      : patient.identifier?.[0]?.value || "-",
                },
                {
                  label: "Full Name",
                  value: getPatientName(),
                },
                {
                  label: "Date of Birth",
                  value: formatDate(patient.birthDate),
                },
              ]}
            />
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
