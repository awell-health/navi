"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";

export default function PatientIntakePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <NaviProvider
        publishableKey="pk_test-sXbLlQC3cgLxpAMGCtuCK" // baker-pro
        // publishableKey="pk_test-EFlZSnSvIzc67Lnx8HZW6" // awell dev
        config={{
          verbose: true,
        }}
      >
        <NaviEmbed
          careflowDefinitionId="1CnTTHNYM1Q3"
          /* A patient identifier is optional -- you can also use an Awell patient ID. */
          patientIdentifier={{
            system: "https://www.medplum.com/docs/api/fhir/resources/patient",
            value: "fake_medplum_jb",
          }}
          onReady={() => {
            console.log("✅ Navi embed is ready");
          }}
          onError={(error: any) => {
            console.error("❌ Navi embed error:", error);
          }}
          onActivityCompleted={(data: any) => {
            console.log("🎉 Activity completed:", data);
          }}
        />
      </NaviProvider>
    </div>
  );
}
