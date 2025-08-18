import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { SessionService } from "./service";
import * as Store from "./store";
import { AuthService, SessionTokenDataSchema } from "@awell-health/navi-core";
import { SessionErrorCode } from "./error";

const nowSec = () => Math.floor(Date.now() / 1000);

describe("SessionService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getEmbedSessionAndMintJwt", () => {
    it("throws NO_SESSION_FOUND when store returns null", async () => {
      vi.spyOn(Store, "getSession").mockResolvedValue(null);
      await expect(
        SessionService.getEmbedSessionAndMintJwt("sess_missing")
      ).rejects.toMatchObject({ code: SessionErrorCode.NO_SESSION_FOUND });
    });

    it("throws INVALID_SESSION_TYPE when store returns invalid shape", async () => {
      // Force an invalid object bypassing store validation
      vi.spyOn(Store, "getSession").mockResolvedValue({
        state: "bogus",
      } as any);
      await expect(
        SessionService.getEmbedSessionAndMintJwt("sess_bad")
      ).rejects.toMatchObject({ code: SessionErrorCode.INVALID_SESSION_TYPE });
    });

    it("throws SESSION_IN_ERROR_STATE when state=error", async () => {
      const errorSession = {
        sessionId: "sess_err",
        state: "error",
        orgId: "org",
        tenantId: "tenant",
        environment: "test",
        createdAt: Date.now(),
        exp: nowSec() + 60,
        errorMessage: "activation failed",
      } as const;
      vi.spyOn(Store, "getSession").mockResolvedValue(errorSession as any);
      await expect(
        SessionService.getEmbedSessionAndMintJwt("sess_err")
      ).rejects.toMatchObject({
        code: SessionErrorCode.SESSION_IN_ERROR_STATE,
      });
    });

    it("returns jwt and session for created session", async () => {
      const created = {
        sessionId: "sess_created",
        careflowDefinitionId: "def_id",
        state: "created",
        orgId: "org",
        tenantId: "tenant",
        environment: "test",
        createdAt: Date.now(),
        exp: nowSec() + 60,
      } as const;

      vi.spyOn(Store, "getSession").mockResolvedValue(created as any);
      vi.spyOn(AuthService.prototype, "initialize").mockResolvedValue();
      vi.spyOn(AuthService.prototype, "createJWTFromSession").mockResolvedValue(
        "mock.jwt"
      );

      const result = await SessionService.getEmbedSessionAndMintJwt(
        created.sessionId
      );
      expect(result.jwt).toBe("mock.jwt");
      expect(result.session).toMatchObject({ state: "created" });
    });
  });

  describe("refreshSessionAndMintJwt", () => {
    it("throws NO_SESSION_FOUND when request has no session id", async () => {
      vi.spyOn(SessionService, "resolveSessionFromRequest").mockResolvedValue({
        sessionId: null,
        authenticationState: "unauthenticated",
      });
      await expect(
        SessionService.refreshSessionAndMintJwt({} as any)
      ).rejects.toMatchObject({ code: SessionErrorCode.NO_SESSION_FOUND });
    });

    it("extends TTL and returns jwt for existing session", async () => {
      const base = SessionTokenDataSchema.parse({
        orgId: "org",
        tenantId: "tenant",
        environment: "test",
        exp: nowSec() + 60,
      });

      vi.spyOn(SessionService, "resolveSessionFromRequest").mockResolvedValue({
        sessionId: "sess_ok",
        authenticationState: "verified",
      });
      vi.spyOn(Store, "getSession").mockResolvedValue({
        ...base,
        careflowDefinitionId: "def_id",
        sessionId: "sess_ok",
        state: "created",
      } as any);
      vi.spyOn(Store, "setSession").mockResolvedValue();
      vi.spyOn(AuthService.prototype, "initialize").mockResolvedValue();
      vi.spyOn(AuthService.prototype, "createJWTFromSession").mockResolvedValue(
        "mock.jwt"
      );

      const { jwt, sessionId, sessionExpiresAtIso } =
        await SessionService.refreshSessionAndMintJwt({} as any);
      expect(jwt).toBe("mock.jwt");
      expect(sessionId).toBe("sess_ok");
      expect(typeof sessionExpiresAtIso).toBe("string");
    });
  });
});
