"use client";

import React, { useState } from "react";
import { 
  Pill, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Info,
  RefreshCcwIcon,
  AlertTriangle,
  Pause,
  XCircle,
  Activity,
  Droplets,
  Timer,
  ChevronUp,
  ChevronDown,
  Hash,
  Database,
  Code2
} from "lucide-react";
import { PatientIdentifier } from "@awell-health/navi-core";
import { usePatientMedications } from "../hooks/use-patient-medications";
import { Button } from "../../../../components/ui";
import type { MedicationStatement, Medication } from "@medplum/fhirtypes";

interface MedicationsListProps {
  patientIdentifier: PatientIdentifier;
}

export function MedicationsList({ patientIdentifier }: MedicationsListProps) {
  const { medicationStatements, medications, loading, error, refetchMedications } = usePatientMedications(patientIdentifier);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Toggle expand/collapse for medication items
  const toggleExpanded = (medicationId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(medicationId)) {
        newSet.delete(medicationId);
      } else {
        newSet.add(medicationId);
      }
      return newSet;
    });
  };

  // Helper function to find associated Medication resource
  const findMedicationResource = (medicationStatement: MedicationStatement): Medication | null => {
    if (!medicationStatement.medicationReference?.reference) {
      return null;
    }
    
    const medicationId = medicationStatement.medicationReference.reference.replace("Medication/", "");
    return medications.find(med => med.id === medicationId) || null;
  };

  // Helper function to get medication name with enhanced data from Medication resource
  const getMedicationName = (medicationStatement: MedicationStatement): string => {
    // First try to get name from the associated Medication resource
    const medicationResource = findMedicationResource(medicationStatement);
    if (medicationResource) {
      // Try to get name from Medication resource
      if (medicationResource.code?.text) {
        return medicationResource.code.text;
      }
      
      if (medicationResource.code?.coding?.[0]?.display) {
        return medicationResource.code.coding[0].display;
      }
      
      if (medicationResource.code?.coding?.[0]?.code) {
        return medicationResource.code.coding[0].code;
      }
    }
    
    // Fallback to MedicationStatement data
    if (medicationStatement.medicationCodeableConcept?.text) {
      return medicationStatement.medicationCodeableConcept.text;
    }
    
    if (medicationStatement.medicationCodeableConcept?.coding?.[0]?.display) {
      return medicationStatement.medicationCodeableConcept.coding[0].display;
    }
    
    if (medicationStatement.medicationCodeableConcept?.coding?.[0]?.code) {
      return medicationStatement.medicationCodeableConcept.coding[0].code;
    }
    
    // Check medicationReference
    if (medicationStatement.medicationReference?.display) {
      return medicationStatement.medicationReference.display;
    }
    
    return "Unknown Medication";
  };

  // Helper function to get medication status with task-like styling
  const getMedicationStatus = (medicationStatement: MedicationStatement): { 
    status: string; 
    className: string;
    icon: React.ReactNode;
  } => {
    if (medicationStatement.status === "active") {
      return {
        status: "Active",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <Activity className="w-3 h-3" />
      };
    }
    
    if (medicationStatement.status === "completed") {
      return {
        status: "Completed",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle className="w-3 h-3" />
      };
    }
    
    if (medicationStatement.status === "stopped") {
      return {
        status: "Stopped",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle className="w-3 h-3" />
      };
    }
    
    if (medicationStatement.status === "on-hold") {
      return {
        status: "On Hold",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Pause className="w-3 h-3" />
      };
    }
    
    if (medicationStatement.status === "entered-in-error") {
      return {
        status: "Error",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertTriangle className="w-3 h-3" />
      };
    }
    
    if (medicationStatement.status === "intended") {
      return {
        status: "Intended",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Clock className="w-3 h-3" />
      };
    }
    
    if (medicationStatement.status === "not-taken") {
      return {
        status: "Not Taken",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <XCircle className="w-3 h-3" />
      };
    }
    
    if (medicationStatement.status === "unknown") {
      return {
        status: "Unknown",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <Info className="w-3 h-3" />
      };
    }
    
    // Fallback for any unexpected status
    return {
      status: "Unknown",
      className: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <Info className="w-3 h-3" />
    };
  };

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to get effective date/time
  const getEffectiveDate = (medicationStatement: MedicationStatement): string => {
    if (medicationStatement.effectiveDateTime) {
      return formatDate(medicationStatement.effectiveDateTime);
    }
    
    if (medicationStatement.effectivePeriod?.start) {
      const start = formatDate(medicationStatement.effectivePeriod.start);
      const end = medicationStatement.effectivePeriod.end 
        ? formatDate(medicationStatement.effectivePeriod.end)
        : "ongoing";
      return `${start} - ${end}`;
    }
    
    return "Not specified";
  };

  // Helper function to get enhanced dosage information
  const getDosageInfo = (medicationStatement: MedicationStatement): { 
    dose: string; 
    frequency: string; 
    route: string; 
    fullText: string;
  } => {
    const dosage = medicationStatement.dosage?.[0];
    if (!dosage) {
      return {
        dose: "Not specified",
        frequency: "",
        route: "",
        fullText: "Dosage not specified"
      };
    }
    
    // If there's text description, parse it for better display
    if (dosage.text) {
      const text = dosage.text;
      return {
        dose: text,
        frequency: "",
        route: "",
        fullText: text
      };
    }
    
    const parts: string[] = [];
    let dose = "";
    let frequency = "";
    let route = "";
    
    // Get dose information
    if (dosage.doseAndRate?.[0]?.doseQuantity) {
      const doseQuantity = dosage.doseAndRate[0].doseQuantity;
      dose = `${doseQuantity.value}${doseQuantity.unit ? ` ${doseQuantity.unit}` : ''}`;
      parts.push(dose);
    }
    
    // Get timing/frequency information
    if (dosage.timing?.repeat) {
      const timing = dosage.timing.repeat;
      if (timing.frequency) {
        const period = timing.periodUnit || "d";
        const periodValue = timing.period || 1;
        
        if (timing.frequency === 1) {
          if (period === "d") {
            frequency = "Once daily";
          } else if (period === "wk") {
            frequency = "Once weekly";
          } else if (period === "mo") {
            frequency = "Once monthly";
          } else if (period === "h") {
            frequency = "Once hourly";
          } else {
            frequency = `Once per ${period}`;
          }
        } else {
          if (periodValue > 1) {
            frequency = `${timing.frequency}x every ${periodValue} ${period}s`;
          } else {
            frequency = `${timing.frequency}x per ${period}`;
          }
        }
        parts.push(frequency);
      }
    }
    
    // Get route information
    if (dosage.route?.text) {
      route = dosage.route.text;
      parts.push(route);
    } else if (dosage.route?.coding?.[0]?.display) {
      route = dosage.route.coding[0].display;
      parts.push(route);
    }
    
    return {
      dose,
      frequency,
      route,
      fullText: parts.length > 0 ? parts.join(" ") : "Dosage not specified"
    };
  };

  // Helper function to get reason for medication
  const getMedicationReason = (medicationStatement: MedicationStatement): string => {
    if (medicationStatement.reasonCode?.[0]?.text) {
      return medicationStatement.reasonCode[0].text;
    }
    
    if (medicationStatement.reasonCode?.[0]?.coding?.[0]?.display) {
      return medicationStatement.reasonCode[0].coding[0].display;
    }
    
    return "Not specified";
  };

  // Helper function to render medical codes
  const renderMedicalCodes = (medicationResource: Medication | null): React.ReactNode => {
    if (!medicationResource?.code?.coding) return null;

    const rxnormCode = medicationResource.code.coding.find(c => c.system === "http://www.nlm.nih.gov/research/umls/rxnorm");
    const snomedCode = medicationResource.code.coding.find(c => c.system === "http://snomed.info/sct");

    if (!rxnormCode && !snomedCode) return null;

    const renderCodeItem = (label: string, code: string | undefined, display: string | undefined, icon: React.ReactNode, color: string) => {
      return (
        <div className="flex items-center gap-2 text-xs text-gray-600 font-normal">
          <div className="flex items-center gap-1.5">
            <div className={`p-1 rounded ${color}`}>
              {icon}
            </div>
            <span className="font-medium">{label}:</span>
          </div>
          <div className="flex items-center gap-1">
            {display && (
              <span className="text-gray-500 text-xs">
                {display}
              </span>
            )}
            {code && (
              <div className="flex items-center">
                <Hash className="w-3 h-3 text-gray-600" />
                <span className="font-mono text-xs bg-gray-100 px-0.5 py-0.5 rounded text-gray-900">
                  {code}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="w-3 h-3 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">Medical Codes</span>
        </div>
        <div className="space-y-2">
          {/* RxNorm Code */}
          {rxnormCode && renderCodeItem(
            "RxNorm", 
            rxnormCode.code, 
            rxnormCode.display, 
            <Database className="w-3 h-3 text-blue-600" />,
            "bg-blue-50"
          )}
          {/* SNOMED Code */}
          {snomedCode && renderCodeItem(
            "SNOMED", 
            snomedCode.code, 
            snomedCode.display, 
            <Database className="w-3 h-3 text-green-600" />,
            "bg-green-50"
          )}
        </div>
      </div>
    );
  };


  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 font-medium mb-2">Error Loading Medications</div>
        <p className="text-gray-600 text-sm">
          {error.message || "Unable to load patient medications"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-900">
          Medications ({medicationStatements.length})
        </div>
        <div>
          <Button size="icon" variant="ghost" onClick={refetchMedications} title="Refresh Medications">
            <RefreshCcwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && <div className="space-y-2">
        <>
        {medicationStatements.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-900 font-medium mb-2">No Medications Found</div>
            <p className="text-gray-600 text-sm">
              This patient currently has no medications recorded.
            </p>
          </div>
        )}
        </>
        {medicationStatements.map((medicationStatement) => {
          const statusInfo = getMedicationStatus(medicationStatement);
          const medicationName = getMedicationName(medicationStatement);
          const effectiveDate = getEffectiveDate(medicationStatement);
          const dosageInfo = getDosageInfo(medicationStatement);
          const reason = getMedicationReason(medicationStatement);
          const medicationResource = findMedicationResource(medicationStatement);
          const isExpanded = expandedItems.has(medicationStatement.id || '');
          
          return (
            <div
              key={medicationStatement.id}
              className="border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              {/* Always visible header */}
              <div 
                className="flex justify-between p-3 cursor-pointer"
                onClick={() => toggleExpanded(medicationStatement.id || '')}
              >
                <div className="flex justify-between w-full items-center">
                  <div className="font-medium text-gray-900 flex flex-col gap-1 flex-1">
                    {/* Medication name and dosage */}
                    <div className="text-sm font-medium">
                      {medicationName}
                    </div>

                    <div className="flex gap-2 mb-1">
                      {dosageInfo.dose && dosageInfo.dose !== "Not specified" && (
                        <span className="text-gray-600 text-xs">
                          {dosageInfo.dose}
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.status}</span>
                        </span>
                      </div>

                      {/* Effective date */}
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
                        <div className="p-0.5 rounded bg-orange-50">
                          <Calendar className="w-3 h-3 text-orange-600" />
                        </div>
                        <span className="font-medium">Effective:</span>
                        <span className="text-gray-800">{effectiveDate}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    {reason !== "Not specified" && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
                        <div className="p-0.5 rounded bg-blue-50">
                          <Info className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="font-medium">Reason:</span>
                        <span className="text-gray-800">{reason}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Expand/collapse icon */}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable detailed information */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                  <div className="space-y-2">
                    {/* Frequency */}
                    {dosageInfo.frequency && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
                        <div className="p-0.5 rounded bg-green-50">
                          <Timer className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="font-medium">Frequency:</span>
                        <span className="text-gray-800">{dosageInfo.frequency}</span>
                      </div>
                    )}
                    
                    {/* Route */}
                    {dosageInfo.route && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-normal">
                        <div className="p-0.5 rounded bg-purple-50">
                          <Pill className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="font-medium">Route:</span>
                        <span className="text-gray-800">{dosageInfo.route}</span>
                      </div>
                    )}

                    {/* Medical Codes */}
                    {renderMedicalCodes(medicationResource)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>}
    </div>
  );
}
