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
  );
};
