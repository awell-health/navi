"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";

export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Simple Navi Embed Example</h1>
      <NaviProvider publishableKey="pk_test_awell_dev">
        <NaviEmbed
          sessionId="e05e7a4b-e51c-4368-a8f7-38d0f0845b0c"
          careflowDefinitionId="1CnTTHNYM1Q3"
          /* A patient identifier is optional -- you can also use an Awell patient ID. */
          patientIdentifier={{
            system: "https://www.medplum.com/docs/api/fhir/resources/patient",
            value: "fake_medplum_jb",
          }}
          stakeholderId="zJ_wFE9MiVjy"
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
