"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";

export default function PatientIntakePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <NaviProvider
        publishableKey="pk_test-EFlZSnSvIzc67Lnx8HZW6"
        config={{
          origin: "http://localhost:3000",
          embedOrigin: "http://localhost:3000",
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
