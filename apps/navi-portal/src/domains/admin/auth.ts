"use server";

import { cookies } from "next/headers";
import { env } from "@/env";
import { B2BClient } from "stytch";

export type AdminPrincipal = {
  email: string;
  name?: string | null;
  memberId?: string | null;
};

function getAllowedDomain(): string {
  return env.ADMIN_ALLOWED_GOOGLE_DOMAIN ?? "awellhealth.com";
}

function assertEmailDomain(email: string, allowedDomain: string): void {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@").pop();
  if (!domain || domain !== allowedDomain) {
    throw new Error("Forbidden: Email domain is not allowed");
  }
}

async function getStytchClient(): Promise<B2BClient> {
  return new B2BClient({
    project_id: env.STYTCH_B2B_PROJECT_ID,
    secret: env.STYTCH_B2B_SECRET,
    custom_base_url: env.STYTCH_B2B_BASE_URL,
  });
}

export async function requireAdmin(): Promise<AdminPrincipal> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("stytch_session")?.value;
  if (!sessionToken) {
    throw new Error("Unauthorized: No session");
  }

  const client = await getStytchClient();
  const result = await client.sessions.authenticate({
    session_token: sessionToken,
  });

  const email = result?.member?.email_address;
  if (!email) {
    throw new Error("Unauthorized: Missing email on member");
  }

  assertEmailDomain(email, getAllowedDomain());

  return {
    email,
    name: result?.member?.name ?? null,
    memberId: (result?.member?.member_id as string | undefined) ?? null,
  };
}
