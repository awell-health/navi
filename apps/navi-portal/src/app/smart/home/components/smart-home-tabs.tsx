"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { TaskList } from "./task-list";
import { PatientInfoCard } from "./patient-info-card";
import { PatientIdentifier } from "@awell-health/navi-core";

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

  return (
    <Tabs defaultValue="context" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger 
          value="context" 
          isActive={activeTab === "context"}
          onClick={() => setActiveTab("context")}
        >
          Context
        </TabsTrigger>
        <TabsTrigger 
          value="tasks" 
          isActive={activeTab === "tasks"}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="context" isActive={activeTab === "context"} className="mt-6">
        <div className="space-y-4">
          <PatientInfoCard patient={patient} patientIdentifier={patientIdentifier} />
        </div>
      </TabsContent>
      
      <TabsContent value="tasks" isActive={activeTab === "tasks"} className="mt-6">
        <TaskList
          patient={patient}
          patientIdentifier={patientIdentifier}
        />
      </TabsContent>
    </Tabs>
  );
}
