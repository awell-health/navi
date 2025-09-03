"use client";

import { env } from "@/env";
import { StytchB2BProvider } from "@stytch/nextjs/b2b";
import { createStytchB2BHeadlessClient } from "@stytch/nextjs/b2b/headless";
import { useMemo } from "react";

export const Bootstrap = ({
  stytchPublicToken,
  cookieDomain,
  useHttpOnly,
  children,
}: {
  stytchPublicToken: string;
  cookieDomain?: string;
  useHttpOnly?: boolean;
  children: React.ReactNode;
}) => {
  const stytchClient = useMemo(() => {
    const options = useHttpOnly
      ? {
          cookieOptions: {
            availableToSubdomains: true,
            domain: cookieDomain,
          },
          endpointOptions: {
            testApiDomain: "test-auth.navi-portal.awellhealth.com",
            apiDomain: "auth.navi-portal.awellhealth.com",
          },
        }
      : {};
    return createStytchB2BHeadlessClient(stytchPublicToken, options);
  }, [stytchPublicToken, cookieDomain, useHttpOnly]);
  return (
    <StytchB2BProvider stytch={stytchClient}>{children}</StytchB2BProvider>
  );
};
