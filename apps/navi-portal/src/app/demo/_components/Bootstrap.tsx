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
  const stytchClient = useMemo(
    () =>
      createStytchB2BHeadlessClient(stytchPublicToken, {
        cookieOptions: {
          availableToSubdomains: true,
          // Consider only setting in prod; this breaks on localhost
          ...(useHttpOnly && { domain: cookieDomain }),
        },
        ...(useHttpOnly && {
          endpointOptions: {
            testApiDomain: "test-auth.navi-portal.awellhealth.com",
            apiDomain: "auth.navi-portal.awellhealth.com",
          },
        }),
      }),
    [stytchPublicToken]
  );
  return (
    <StytchB2BProvider stytch={stytchClient}>{children}</StytchB2BProvider>
  );
};
