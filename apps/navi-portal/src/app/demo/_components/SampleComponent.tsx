"use client";

import {
  useStytchMember,
  useStytchOrganization,
  // useStytchB2BClient,
} from "@stytch/nextjs/b2b";
// import { useEffect } from "react";

export const SampleComponent = (
  {
    //   session_token,
    //   session_jwt,
    // }: {
    //   session_token: string;
    //   session_jwt: string;
  }
) => {
  const { organization } = useStytchOrganization();
  const { member } = useStytchMember();
  // const client = useStytchB2BClient();
  // useEffect(() => {
  //   client.session.updateSession({
  //     session_token,
  //     session_jwt,
  //   });
  //   client.session.authenticate({ session_duration_minutes: 60 });
  // }, [client]);
  return (
    <div>
      <h2>Organization</h2>
      <pre>{JSON.stringify(organization, null, 2)}</pre>
      <h2>Member</h2>
      <pre>{JSON.stringify(member, null, 2)}</pre>
    </div>
  );
};
