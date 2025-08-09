import { env } from "@/env";

type StytchEnv = "test" | "live";

interface StytchClientOptions {
  projectId: string;
  secret: string;
  environment: StytchEnv;
}

export class StytchClient {
  private readonly projectId: string;
  private readonly secret: string;
  private readonly environment: StytchEnv;
  private readonly baseUrl: string;

  constructor(options: StytchClientOptions) {
    this.projectId = options.projectId;
    this.secret = options.secret;
    this.environment = options.environment;
    const host =
      this.environment === "live" ? "api.stytch.com" : "test.stytch.com";
    this.baseUrl = `https://${host}/v1`; // base for API v1
  }

  private authHeader(): string {
    const raw = `${this.projectId}:${this.secret}`;
    let encoded: string;
    if (typeof btoa === "function") {
      encoded = btoa(raw);
    } else if (typeof Buffer !== "undefined") {
      // Node.js fallback if not in Edge runtime
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      encoded = Buffer.from(raw as unknown as string).toString("base64");
    } else {
      // Very unlikely fallback: manual base64 via TextEncoder+crypto (not needed in practice)
      // Keeping minimal to avoid heavy code; this path should not be reached in Next 15 environments.
      encoded = raw;
    }
    return `Basic ${encoded}`;
  }

  async loginOrCreateSms(
    phoneNumber: string,
    expirationMinutes?: number
  ): Promise<{ user_id: string; phone_id: string; request_id: string }> {
    const res = await fetch(`${this.baseUrl}/otps/sms/login_or_create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader(),
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        ...(expirationMinutes ? { expiration_minutes: expirationMinutes } : {}),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Stytch SMS login_or_create failed: ${res.status} ${text}`
      );
    }
    const json = (await res.json()) as {
      user_id: string;
      phone_id: string;
      request_id: string;
    };
    return json;
  }

  async loginOrCreateEmail(
    email: string,
    expirationMinutes?: number
  ): Promise<{ user_id: string; email_id: string; request_id: string }> {
    const res = await fetch(`${this.baseUrl}/otps/email/login_or_create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader(),
      },
      body: JSON.stringify({
        email,
        ...(expirationMinutes ? { expiration_minutes: expirationMinutes } : {}),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Stytch Email login_or_create failed: ${res.status} ${text}`
      );
    }
    const json = (await res.json()) as {
      user_id: string;
      email_id: string;
      request_id: string;
    };
    return json;
  }

  async authenticateOtp(
    methodId: string,
    code: string
  ): Promise<{ request_id?: string; user_id?: string }> {
    const res = await fetch(`${this.baseUrl}/otps/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader(),
      },
      body: JSON.stringify({ method_id: methodId, code }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stytch OTP verify failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as {
      request_id?: string;
      user_id?: string;
    };
    return { request_id: json.request_id, user_id: json.user_id };
  }
}

export function createStytchClient(): StytchClient | null {
  const projectId = env.STYTCH_PROJECT_ID;
  const secret = env.STYTCH_SECRET;
  const environment = (env.STYTCH_ENV ?? "test") as StytchEnv;
  if (!projectId || !secret) return null;
  return new StytchClient({ projectId, secret, environment });
}
