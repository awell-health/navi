"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const Embed = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  return (
    <NaviProvider
      // publishableKey="pk_test-sXbLlQC3cgLxpAMGCtuCK" // baker-pro
      // publishableKey="pk_test-EFlZSnSvIzc67Lnx8HZW6" // awell dev
      publishableKey="pk_test-UfYqfiAQUN6s0gQ7bHczu" // awell dev sandbox
      config={{
        embedOrigin: "http://localhost:3000",
      }}
    >
      <NaviEmbed
        sessionId={sessionId}
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
  );
};

export default function PatientIntakePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      this is the customer website
      <Suspense fallback={<div>Loading...</div>}>
        <Embed />
      </Suspense>
    </div>
  );
}
