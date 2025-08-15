import { describe, it, expect } from "vitest";
import { shortDeterministicId } from "./helpers";
import type { SessionTokenData } from "./types";

const BASE_SESSION: SessionTokenData = {
  patientId: "patient_123",
  careflowId: "careflow_456",
  stakeholderId: "stakeholder_789",
  orgId: "org_abc",
  tenantId: "tenant_def",
  environment: "test",
  naviStytchUserId: "user_111",
  exp: 1_725_000_000,
};

function orderVariant(session: SessionTokenData): SessionTokenData {
  // Return the same keys with a different insertion order
  return {
    environment: session.environment,
    tenantId: session.tenantId,
    orgId: session.orgId,
    patientId: session.patientId,
    careflowId: session.careflowId,
    stakeholderId: session.stakeholderId,
    naviStytchUserId: session.naviStytchUserId,
    exp: session.exp,
  };
}

describe("shortDeterministicId", () => {
  it("produces the same id regardless of key order (default length)", async () => {
    const a = await shortDeterministicId(BASE_SESSION);
    const b = await shortDeterministicId(orderVariant(BASE_SESSION));
    expect(a).toBe(b);
    expect(a).toHaveLength(12);
  });

  it("is stable across lengths", async () => {
    const id8 = await shortDeterministicId(BASE_SESSION, 8);
    const id12 = await shortDeterministicId(BASE_SESSION, 12);
    const id20 = await shortDeterministicId(BASE_SESSION, 20);
    expect(id8).toBe(id12.slice(0, 8));
    expect(id20.startsWith(id12)).toBe(true);
  });

  it("changes when relevant field changes", async () => {
    const base = await shortDeterministicId(BASE_SESSION);
    const changed = await shortDeterministicId({
      ...BASE_SESSION,
      patientId: "patient_999",
    });
    expect(changed).not.toBe(base);
  });
});
