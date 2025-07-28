import { describe, it, expect } from "vitest";
import { NaviAuthError, AuthErrorType } from "./errors";

describe("NaviAuthError", () => {
  describe("constructor", () => {
    it("should create error with default type", () => {
      const error = new NaviAuthError("Test message");

      expect(error.message).toBe("Test message");
      expect(error.errorType).toBe(AuthErrorType.UNKNOWN_AUTH_ERROR);
      expect(error.code).toBe("AUTH_UNKNOWN_AUTH_ERROR");
      expect(error.name).toBe("NaviAuthError");
      expect(error.validationErrors).toBeUndefined();
    });

    it("should create error with specific type", () => {
      const error = new NaviAuthError(
        "Token expired",
        AuthErrorType.TOKEN_EXPIRED
      );

      expect(error.message).toBe("Token expired");
      expect(error.errorType).toBe(AuthErrorType.TOKEN_EXPIRED);
      expect(error.code).toBe("AUTH_TOKEN_EXPIRED");
    });

    it("should extract validation errors from details", () => {
      const validationErrors = [{ path: ["field"], message: "Required" }];
      const error = new NaviAuthError(
        "Validation failed",
        AuthErrorType.PAYLOAD_VALIDATION_FAILED,
        { validationErrors }
      );

      expect(error.validationErrors).toEqual(validationErrors);
    });
  });

  describe("static factory methods", () => {
    describe("notInitialized", () => {
      it("should create NOT_INITIALIZED error with default message", () => {
        const error = NaviAuthError.notInitialized();

        expect(error.message).toBe("Auth service not initialized");
        expect(error.errorType).toBe(AuthErrorType.NOT_INITIALIZED);
        expect(error.code).toBe("AUTH_NOT_INITIALIZED");
      });

      it("should create NOT_INITIALIZED error with custom message", () => {
        const error = NaviAuthError.notInitialized("Custom message");

        expect(error.message).toBe("Custom message");
        expect(error.errorType).toBe(AuthErrorType.NOT_INITIALIZED);
      });
    });

    describe("initializationFailed", () => {
      it("should create INITIALIZATION_FAILED error", () => {
        const originalError = new Error("Crypto error");
        const error = NaviAuthError.initializationFailed(originalError);

        expect(error.message).toBe("Failed to initialize auth service");
        expect(error.errorType).toBe(AuthErrorType.INITIALIZATION_FAILED);
        expect(error.details?.error).toBe(originalError);
      });
    });

    describe("invalidSessionData", () => {
      it("should create INVALID_SESSION_DATA error without validation errors", () => {
        const error = NaviAuthError.invalidSessionData();

        expect(error.message).toBe("Invalid session token data");
        expect(error.errorType).toBe(AuthErrorType.INVALID_SESSION_DATA);
        expect(error.validationErrors).toBeUndefined();
      });

      it("should create INVALID_SESSION_DATA error with validation errors", () => {
        const validationErrors = [{ path: ["patientId"], message: "Required" }];
        const error = NaviAuthError.invalidSessionData(validationErrors);

        expect(error.validationErrors).toEqual(validationErrors);
      });
    });

    describe("sessionTokenCreationFailed", () => {
      it("should create SESSION_TOKEN_CREATION_FAILED error", () => {
        const originalError = new Error("JWT signing failed");
        const error = NaviAuthError.sessionTokenCreationFailed(originalError);

        expect(error.message).toBe("Failed to create session token");
        expect(error.errorType).toBe(
          AuthErrorType.SESSION_TOKEN_CREATION_FAILED
        );
        expect(error.details?.error).toBe(originalError);
      });
    });

    describe("jwtCreationFailed", () => {
      it("should create JWT_CREATION_FAILED error", () => {
        const originalError = new Error("JWT creation failed");
        const error = NaviAuthError.jwtCreationFailed(originalError);

        expect(error.message).toBe("Failed to create JWT from session");
        expect(error.errorType).toBe(AuthErrorType.JWT_CREATION_FAILED);
        expect(error.details?.error).toBe(originalError);
      });
    });

    describe("invalidToken", () => {
      it("should create INVALID_TOKEN_FORMAT error with default message", () => {
        const error = NaviAuthError.invalidToken();

        expect(error.message).toBe("Invalid or expired token");
        expect(error.errorType).toBe(AuthErrorType.INVALID_TOKEN_FORMAT);
      });

      it("should create TOKEN_EXPIRED error for expired JWT", () => {
        const jwtError = { code: "ERR_JWT_EXPIRED" };
        const error = NaviAuthError.invalidToken("Token expired", jwtError);

        expect(error.message).toBe("Token expired");
        expect(error.errorType).toBe(AuthErrorType.TOKEN_EXPIRED);
        expect(error.details?.error).toBe(jwtError);
      });

      it("should create TOKEN_SIGNATURE_INVALID error for signature failure", () => {
        const jwtError = { code: "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" };
        const error = NaviAuthError.invalidToken("Signature invalid", jwtError);

        expect(error.message).toBe("Signature invalid");
        expect(error.errorType).toBe(AuthErrorType.TOKEN_SIGNATURE_INVALID);
        expect(error.details?.error).toBe(jwtError);
      });

      it("should create INVALID_TOKEN_FORMAT error for unknown JWT error", () => {
        const jwtError = { code: "ERR_UNKNOWN" };
        const error = NaviAuthError.invalidToken("Unknown error", jwtError);

        expect(error.message).toBe("Unknown error");
        expect(error.errorType).toBe(AuthErrorType.INVALID_TOKEN_FORMAT);
      });
    });

    describe("payloadValidationFailed", () => {
      it("should create PAYLOAD_VALIDATION_FAILED error", () => {
        const validationErrors = [
          { path: ["sub"], message: "Required" },
          { path: ["exp"], message: "Must be positive" },
        ];
        const error = NaviAuthError.payloadValidationFailed(validationErrors);

        expect(error.message).toBe("Token payload validation failed");
        expect(error.errorType).toBe(AuthErrorType.PAYLOAD_VALIDATION_FAILED);
        expect(error.validationErrors).toEqual(validationErrors);
      });
    });

    describe("sessionConversionFailed", () => {
      it("should create SESSION_CONVERSION_FAILED error", () => {
        const validationErrors = [
          { path: ["environment"], message: "Invalid enum" },
        ];
        const error = NaviAuthError.sessionConversionFailed(validationErrors);

        expect(error.message).toBe("Invalid session data for JWT creation");
        expect(error.errorType).toBe(AuthErrorType.SESSION_CONVERSION_FAILED);
        expect(error.validationErrors).toEqual(validationErrors);
      });
    });

    describe("sessionTokenValidationFailed", () => {
      it("should create INVALID_SESSION_FORMAT error", () => {
        const validationErrors = [
          { path: ["careflowId"], message: "Required" },
        ];
        const error =
          NaviAuthError.sessionTokenValidationFailed(validationErrors);

        expect(error.message).toBe("Session token validation failed");
        expect(error.errorType).toBe(AuthErrorType.INVALID_SESSION_FORMAT);
        expect(error.validationErrors).toEqual(validationErrors);
      });
    });
  });

  describe("error inheritance", () => {
    it("should be instance of Error", () => {
      const error = new NaviAuthError("Test");
      expect(error).toBeInstanceOf(Error);
    });

    it("should be instance of NaviAuthError", () => {
      const error = NaviAuthError.notInitialized();
      expect(error).toBeInstanceOf(NaviAuthError);
    });
  });

  describe("error handling patterns", () => {
    it("should support switch-case pattern on errorType", () => {
      const jwtError = { code: "ERR_JWT_EXPIRED" };
      const error = NaviAuthError.invalidToken("Token expired", jwtError);

      let handledType: string = "";
      switch (error.errorType) {
        case AuthErrorType.TOKEN_EXPIRED:
          handledType = "expired";
          break;
        case AuthErrorType.NOT_INITIALIZED:
          handledType = "not_initialized";
          break;
        default:
          handledType = "unknown";
      }

      expect(handledType).toBe("expired");
    });
  });
});

describe("AuthErrorType enum", () => {
  it("should have all expected error types", () => {
    expect(AuthErrorType.NOT_INITIALIZED).toBe("NOT_INITIALIZED");
    expect(AuthErrorType.INITIALIZATION_FAILED).toBe("INITIALIZATION_FAILED");
    expect(AuthErrorType.INVALID_SESSION_DATA).toBe("INVALID_SESSION_DATA");
    expect(AuthErrorType.SESSION_TOKEN_CREATION_FAILED).toBe(
      "SESSION_TOKEN_CREATION_FAILED"
    );
    expect(AuthErrorType.JWT_CREATION_FAILED).toBe("JWT_CREATION_FAILED");
    expect(AuthErrorType.INVALID_TOKEN_FORMAT).toBe("INVALID_TOKEN_FORMAT");
    expect(AuthErrorType.TOKEN_SIGNATURE_INVALID).toBe(
      "TOKEN_SIGNATURE_INVALID"
    );
    expect(AuthErrorType.TOKEN_EXPIRED).toBe("TOKEN_EXPIRED");
    expect(AuthErrorType.PAYLOAD_VALIDATION_FAILED).toBe(
      "PAYLOAD_VALIDATION_FAILED"
    );
    expect(AuthErrorType.MISSING_REQUIRED_CLAIMS).toBe(
      "MISSING_REQUIRED_CLAIMS"
    );
    expect(AuthErrorType.INVALID_CLAIMS_FORMAT).toBe("INVALID_CLAIMS_FORMAT");
    expect(AuthErrorType.SESSION_CONVERSION_FAILED).toBe(
      "SESSION_CONVERSION_FAILED"
    );
    expect(AuthErrorType.INVALID_SESSION_FORMAT).toBe("INVALID_SESSION_FORMAT");
    expect(AuthErrorType.UNKNOWN_AUTH_ERROR).toBe("UNKNOWN_AUTH_ERROR");
  });
});
