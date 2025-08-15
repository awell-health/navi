import { SessionTokenDataSchema } from "./schema";
import type {
  CreateCareFlowSessionResponse,
  CreateCareFlowSessionResponseSuccess,
  SessionTokenData,
} from "./types";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeBase62(buffer: Uint8Array): string {
  let num = BigInt(
    "0x" +
      Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
  );
  let chars: string[] = [];
  while (num > 0n) {
    const rem = Number(num % 62n);
    chars.push(BASE62[rem]);
    num = num / 62n;
  }
  return chars.reverse().join("");
}

export async function shortDeterministicId(
  sessionData: SessionTokenData,
  length = 12
): Promise<string> {
  // We parse to ensure the object is always in the same order
  const parsed = SessionTokenDataSchema.parse(sessionData);
  const json = JSON.stringify(parsed);
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(json)
  );
  const hashArray = new Uint8Array(hashBuffer);

  const b62 = encodeBase62(hashArray);
  return b62.slice(0, length);
}

export const isSessionResponseSuccess = (
  response: CreateCareFlowSessionResponse
): response is CreateCareFlowSessionResponseSuccess => {
  return response.success && "embedUrl" in response;
};
