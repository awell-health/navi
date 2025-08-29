"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { TaskList } from "./task-list";
import { PatientIdentifier } from "@awell-health/navi-core";
import { ReusableTabs } from "./reusable-tabs";
import { Task } from "@medplum/fhirtypes";
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

  // Helper function to format patient name
  const getPatientName = () => {
    if (patient.name?.[0]?.text) {
      return patient.name[0].text;
    }
    
    const given = patient.name?.[0]?.given?.join(" ") || "";
    const family = patient.name?.[0]?.family || "";
    
    return [given, family].filter(Boolean).join(" ").trim() || "Unknown Patient";
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

  // Helper function to get phone number
  const getPhoneNumber = () => {
    const phone = patient.telecom?.find(t => t.system === "phone");
    return phone?.value || "-";
  };

  // Helper function to get email
  const getEmail = () => {
    const email = patient.telecom?.find(t => t.system === "email");
    return email?.value || "-";
  };

  // Helper function to get address
  const getAddress = () => {
    const addr = patient.address?.[0];
    if (!addr) return "-";
    
    const parts = [
      addr.line?.[0],
      addr.city,
      addr.state,
      addr.postalCode,
    ].filter(Boolean);
    
    return parts.join(", ") || "-";
  };

  // Helper function to get identifiers count
  const getIdentifiersCount = () => {
    return patient.identifier?.length || 0;
  };

  // Helper function to get telecom count
  const getTelecomCount = () => {
    return patient.telecom?.length || 0;
  };

  const tabs = [
    { id: "context", label: "Context" },
    { id: "tasks", label: "Tasks" },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Separate Header - Context Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 mb-4 border-l border-r border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">{getPatientName()}</span>
          <span>•</span>
          <span>DOB {formatDate(patient.birthDate)}</span>
          <span>•</span>
          <span>Gender {patient.gender || "unknown"}</span>
        </div>
      </div>

      {!selectedTask && <ReusableTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      >
        {/* Context Tab Content */}
        <div 
          className={`space-y-4 ${activeTab === "context" ? "block" : "hidden"}`}
        >
          {/* Patient Details Box - Non-collapsible */}
          <InfoCard
            title="Patient Details & Demographics"
            items={[
              {
                label: "Full Name",
                value: getPatientName()
              },
              {
                label: "Date of Birth",
                value: formatDate(patient.birthDate)
              },
              {
                label: "Gender",
                value: patient.gender || "unknown"
              },
              {
                label: "Phone",
                value: getTelecomCount() > 1 ? (
                  <button className="text-sm text-blue-600 hover:text-blue-800">Show {getTelecomCount()} items</button>
                ) : (
                  getPhoneNumber()
                )
              },
              {
                label: "Email",
                value: getEmail()
              },
              {
                label: "Identifiers",
                value: getIdentifiersCount() > 1 ? (
                  <button className="text-sm text-blue-600 hover:text-blue-800">Show {getIdentifiersCount()} items</button>
                ) : (
                  patient.identifier?.[0]?.value || "-"
                )
              },
              {
                label: "Address",
                value: getAddress()
              }
            ]}
          />
        </div>

        {/* Tasks Tab Content */}
        <div className={activeTab === "tasks" ? "block" : "hidden"}>
          <TaskList patientIdentifier={patientIdentifier} setSelectedTask={setSelectedTask} />
        </div>
      </ReusableTabs>}

      {selectedTask && <TaskView task={selectedTask} onBack={() => setSelectedTask(null)} />}
    </div>
  );
}
