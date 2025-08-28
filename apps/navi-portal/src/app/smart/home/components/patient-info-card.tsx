"use client";

import React, { useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { ChevronUpIcon } from "lucide-react";
import { useMedplum } from "../../../../domains/medplum/MedplumClientProvider";
import { PatientIdentifier } from "../../../../lib/awell-client/generated/graphql";

type PatientResource = {
  id?: string;
  name?: Array<{
    text?: string;
    given?: string[];
    family?: string;
    prefix?: string[];
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

interface PatientInfoCardProps {
  patient: PatientResource;
  patientIdentifier: PatientIdentifier;
}

export function PatientInfoCard({ patient, patientIdentifier }: PatientInfoCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { getPatientByIdentifier } = useMedplum();

  const [medplumPatient, setMedplumPatient] = React.useState<PatientResource | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      const patient = await getPatientByIdentifier(patientIdentifier);
      setMedplumPatient(patient);
    };

    fetchPatient();
  }, [patientIdentifier]);

  // Helper function to format patient name
  const getPatientName = () => {
    if (patient.name?.[0]?.text) {
      return patient.name[0].text;
    }
    
    const given = patient.name?.[0]?.given?.join(" ") || "";
    const family = patient.name?.[0]?.family || "";
    const prefix = patient.name?.[0]?.prefix?.[0] || "";
    
    return [prefix, given, family].filter(Boolean).join(" ").trim() || "Unknown Patient";
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
    const phone = patient.telecom?.find(t => t.system === "phone" && t.use === "home");
    return phone?.value || "-";
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

  // Helper function to get medical record number
  const getMedicalRecordNumber = () => {
    const mrn = patient.identifier?.find(id => 
      id.type?.text === "Medical Record Number" || 
      id.type?.text === "MR"
    );
    return mrn?.value || "-";
  };

  // Polease confirm with Thomas which object we should use patient or medplumPatient
  // Here is link to required fields: 
  // https://awellhealth.slack.com/archives/C08ADAKUAB1/p1756388862499159
  const infoItems = [
    { label: "Patient Name", value: getPatientName() },
    { label: "Medical Record Number", value: getMedicalRecordNumber() },
    { label: "Date of Birth", value: formatDate(patient.birthDate) },
    { label: "Phone Number", value: getPhoneNumber() },
    { label: "Address", value: getAddress() },
  ];

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader 
        className="flex flex-row items-center justify-between cursor-pointer pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-gray-900">Patient Information</h3>
        <ChevronUpIcon 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isExpanded ? "rotate-0" : "rotate-180"
          }`} 
        />
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {infoItems.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <span className="text-sm text-gray-600 font-medium">
                  {item.label}
                </span>
                <span className="text-sm text-gray-900 text-right max-w-[60%]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
