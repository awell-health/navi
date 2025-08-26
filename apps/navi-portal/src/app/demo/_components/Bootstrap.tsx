"use client";

import { StytchB2BProvider } from "@stytch/nextjs/b2b";
import { createStytchB2BHeadlessClient } from "@stytch/nextjs/b2b/headless";

export const Bootstrap = ({
  stytchPublicToken,
  children,
}: {
  stytchPublicToken: string;
  children: React.ReactNode;
}) => {
  const stytchClient = createStytchB2BHeadlessClient(stytchPublicToken, {
    cookieOptions: {
      availableToSubdomains: true,
      domain: "awellhealth.com",
    },
    endpointOptions: {
      testApiDomain: "test-api.stytch.awellhealth.com",
      apiDomain: "api.stytch.awellhealth.com",
    },
  });
  return (
    <StytchB2BProvider stytch={stytchClient}>{children}</StytchB2BProvider>
  );
};
