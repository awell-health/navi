import { NaviEmbed, useNavi } from "@awell-health/navi-js-react";

export const Embed = () => {
  const { loading, error, initialized } = useNavi();

  if (loading || !initialized) {
    return <div>Loading Navi SDK...</div>;
  }

  if (error) {
    return <div>Error loading Navi SDK: {error}</div>;
  }
  return (
    <NaviEmbed
      careflowDefinitionId="1CnTTHNYM1Q3"
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
  );
};
