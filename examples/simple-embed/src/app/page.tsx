"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";
import { techCorpBranding } from "./test_config";

export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Simple Navi Embed Example</h1>
      <NaviProvider
        publishableKey="pk_test_demo123"
        branding={techCorpBranding} // full branding object
      >
        <NaviEmbed
          careflowDefinitionId="1CnTTHNYM1Q3"
          /* A patient identifier is optional -- you can also use an Awell patient ID. */
          patientIdentifier={{
            system: "https://www.medplum.com/docs/api/fhir/resources/patient",
            value: "fake_medplum_jb",
          }}
          stakeholderId="optional_stakeholder_id" // optional -- defaults to 'patient'
          careflowId={undefined} // you have the ability to pass in a care flow id to continue an existing care flow
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
