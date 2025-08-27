"use client";

import { env } from "@/env";
import { StytchB2BProvider } from "@stytch/nextjs/b2b";
import { createStytchB2BHeadlessClient } from "@stytch/nextjs/b2b/headless";
import { useMemo } from "react";

export const Bootstrap = ({
  stytchPublicToken,
  stytchEnv = "test",
  children,
}: {
  stytchPublicToken: string;
  stytchEnv?: "test" | "live";
  children: React.ReactNode;
}) => {
  const stytchClient = useMemo(
    () =>
      createStytchB2BHeadlessClient(stytchPublicToken, {
        cookieOptions: {
          availableToSubdomains: true,
          // Consider only setting in prod; this breaks on localhost
          domain: stytchEnv === "live" ? "awellhealth.com" : undefined,
        },
        endpointOptions: {
          testApiDomain: "test-api.stytch.awellhealth.com",
          apiDomain: "api.stytch.awellhealth.com",
        },
      }),
    [stytchPublicToken]
  );
  return (
    <StytchB2BProvider stytch={stytchClient}>{children}</StytchB2BProvider>
  );
};
