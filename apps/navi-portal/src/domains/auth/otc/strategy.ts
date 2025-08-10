import type { StytchClient } from "@/lib/stytch";

export type OTCMethod = "sms" | "email";

export interface OTCChosen {
  method: OTCMethod;
  destination: string;
}

export interface OtcStartResult {
  method_id: string;
  user_id: string;
  request_id: string;
}

export type OtpAuthResult = Awaited<
  ReturnType<StytchClient["authenticateOtp"]>
>;

interface OTCStartStrategy {
  start(sessionId: string, destination: string): Promise<OtcStartResult>;
}

class SMSOTCStartStrategy implements OTCStartStrategy {
  constructor(private readonly stytch: StytchClient) {}
  async start(
    _sessionId: string,
    destination: string
  ): Promise<OtcStartResult> {
    const resp = await this.stytch.loginOrCreateSms(destination);
    return {
      method_id: resp.phone_id,
      user_id: resp.user_id,
      request_id: resp.request_id,
    };
  }
}

class EmailOTCStartStrategy implements OTCStartStrategy {
  constructor(private readonly stytch: StytchClient) {}
  async start(
    _sessionId: string,
    destination: string
  ): Promise<OtcStartResult> {
    const resp = await this.stytch.loginOrCreateEmail(destination);
    return {
      method_id: resp.email_id,
      user_id: resp.user_id,
      request_id: resp.request_id,
    };
  }
}

export class OTCStartFactory {
  private readonly strategies: Record<OTCMethod, OTCStartStrategy>;
  constructor(private readonly stytch: StytchClient) {
    this.strategies = {
      sms: new SMSOTCStartStrategy(this.stytch),
      email: new EmailOTCStartStrategy(this.stytch),
    };
  }
  async start(sessionId: string, chosen: OTCChosen): Promise<OtcStartResult> {
    return this.strategies[chosen.method].start(sessionId, chosen.destination);
  }
}

export class OTCVerifyFactory {
  constructor(private readonly stytch: StytchClient) {}
  async verify(
    method: OTCMethod,
    methodId: string,
    code: string
  ): Promise<OtpAuthResult> {
    // Currently both methods use same underlying call, but keep method param for extensibility
    return this.stytch.authenticateOtp(methodId, code);
  }
}
