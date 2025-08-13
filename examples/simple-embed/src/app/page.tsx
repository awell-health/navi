"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";

export default function PatientIntakePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      this is the customer website
      <NaviProvider
        // publishableKey="pk_test-sXbLlQC3cgLxpAMGCtuCK" // baker-pro
        publishableKey="pk_test-EFlZSnSvIzc67Lnx8HZW6" // awell dev
        config={{
          alwaysFetch: true,
          embedOrigin: "http://localhost:3000",
          origin: "http://localhost:3000",
        }}
      >
        <NaviEmbed
          careflowDefinitionId="1CnTTHNYM1Q3"
          /* A patient identifier is optional -- you can also use an Awell patient ID. */
          patientIdentifier={{
            system: "https://www.medplum.com/docs/api/fhir/resources/patient",
            value: "fake_medplum_jb",
          }}
          onSessionReady={() => {
            console.log("✅ Navi embed is ready");
          }}
          onSessionError={(event) => {
            console.error("❌ Navi embed error:", event);
          }}
          onActivityCompleted={(event) => {
            console.log("🎉 Activity completed:", event);
          }}
        />
      </NaviProvider>
    </div>
  );
}
