"use client";

import { NaviEmbed, NaviProvider } from "@awell-health/navi-js-react";
import { useSearchParams } from "next/navigation";

export default function PatientIntakePage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return null;
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      this is the customer website
      <NaviProvider
        // publishableKey="pk_test-sXbLlQC3cgLxpAMGCtuCK" // baker-pro
        // publishableKey="pk_test-EFlZSnSvIzc67Lnx8HZW6" // awell dev
        publishableKey="pk_test-UfYqfiAQUN6s0gQ7bHczu" // awell dev sandbox
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
    </div>
  );
}
