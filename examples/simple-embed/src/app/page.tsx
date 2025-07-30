"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";

export default function PatientIntakePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <NaviProvider
        publishableKey="pk_test_awell_dev"
        config={{
          origin: "http://localhost:3000",
          embedOrigin: "http://localhost:3000",
          verbose: true,
        }}
      >
        <NaviEmbed
          sessionId="e05e7a4b-e51c-4368-a8f7-38d0f0845b0c"
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
