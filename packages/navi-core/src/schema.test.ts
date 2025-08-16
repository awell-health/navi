import { describe, it, expect } from "vitest";
import { SessionValueSchema } from "./schema";

describe("SessionValueSchema", () => {
  it("fails to parse an active session when createdAt is 0 (positive constraint)", () => {
    const sample = {
      patientId: "aQMWU2wJQ3lXoAwniICFR",
      careflowId: "JpXFiQqAIAJH",
      stakeholderId: "aQMWU2wJQ3lXoAwniICFR",
      orgId: "organization-live-d4571a47-b857-4cca-8bec-270e6e81f20d",
      tenantId: "RjYVSrXL_uTJ",
      environment: "sandbox",
      createdAt: 0, // Note: schema currently requires positive number
      exp: Math.floor(Date.now() / 1000) + 60,
      sessionId: "iPkt5fDUxi9R",
      state: "active",
    } as const;

    const parsed = SessionValueSchema.safeParse(sample);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      // Ensure the failure is specifically about createdAt positivity
      const hasCreatedAtIssue = parsed.error.issues.some(
        (issue) => issue.path.join(".") === "createdAt"
      );
      expect(hasCreatedAtIssue).toBe(true);
    }
  });

  it("parses an active session when createdAt is missing or positive", () => {
    const sample = {
      patientId: "aQMWU2wJQ3lXoAwniICFR",
      careflowId: "JpXFiQqAIAJH",
      stakeholderId: "aQMWU2wJQ3lXoAwniICFR",
      orgId: "organization-live-d4571a47-b857-4cca-8bec-270e6e81f20d",
      tenantId: "RjYVSrXL_uTJ",
      environment: "sandbox",
      exp: Math.floor(Date.now() / 1000) + 60,
      sessionId: "iPkt5fDUxi9R",
      state: "active",
    } as const;

    const parsed = SessionValueSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    const parsedTwo = SessionValueSchema.safeParse({
      ...sample,
      createdAt: Date.now(),
    });
    expect(parsedTwo.success).toBe(true);
  });
});
