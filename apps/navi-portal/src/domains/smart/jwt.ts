import { env } from "@/env";
import { AuthService } from "@awell-health/navi-core";
import type {
  AuthenticationState,
  TokenEnvironment,
} from "@awell-health/navi-core";

export async function mintAwellJwt(params: {
  sub: string;
  orgId: string;
  tenantId: string;
  environment: TokenEnvironment;
  authenticationState: AuthenticationState;
  naviStytchUserId?: string;
  stakeholderId?: string;
}): Promise<string> {
  const auth = new AuthService();
  await auth.initialize(env.JWT_SIGNING_KEY);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const sessionData = {
    orgId: params.orgId,
    tenantId: params.tenantId,
    environment: params.environment,
    exp: nowSeconds + 15 * 60,
    naviStytchUserId: params.naviStytchUserId,
    stakeholderId: params.stakeholderId,
  } as const;
  const jwt = await auth.createJWTFromSession(
    sessionData,
    params.sub,
    env.JWT_KEY_ID,
    {
      authenticationState: params.authenticationState,
      naviStytchUserId: params.naviStytchUserId,
    }
  );
  return jwt;
}
