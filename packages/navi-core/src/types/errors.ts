/**
 * Base Navi Error Class
 */
export class NaviError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "NaviError";
  }
}

/**
 * Authentication Error Types for categorized error handling
 */
export enum AuthErrorType {
  // Initialization errors
  NOT_INITIALIZED = "NOT_INITIALIZED",
  INITIALIZATION_FAILED = "INITIALIZATION_FAILED",

  // Token creation errors
  INVALID_SESSION_DATA = "INVALID_SESSION_DATA",
  SESSION_TOKEN_CREATION_FAILED = "SESSION_TOKEN_CREATION_FAILED",
  JWT_CREATION_FAILED = "JWT_CREATION_FAILED",

  // Token verification errors
  INVALID_TOKEN_FORMAT = "INVALID_TOKEN_FORMAT",
  TOKEN_SIGNATURE_INVALID = "TOKEN_SIGNATURE_INVALID",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",

  // Payload validation errors
  PAYLOAD_VALIDATION_FAILED = "PAYLOAD_VALIDATION_FAILED",
  MISSING_REQUIRED_CLAIMS = "MISSING_REQUIRED_CLAIMS",
  INVALID_CLAIMS_FORMAT = "INVALID_CLAIMS_FORMAT",

  // Session conversion errors
  SESSION_CONVERSION_FAILED = "SESSION_CONVERSION_FAILED",
  INVALID_SESSION_FORMAT = "INVALID_SESSION_FORMAT",

  // Generic auth failures
  UNKNOWN_AUTH_ERROR = "UNKNOWN_AUTH_ERROR",
}

/**
 * Enhanced Authentication Error Class with categorized error types
 *
 * Provides detailed error categorization for better debugging and error handling.
 * Includes validation errors from Zod parsing failures.
 *
 * @example Error Handling
 * ```typescript
 * try {
 *   const payload = await authService.verifyToken(token);
 * } catch (error) {
 *   if (error instanceof NaviAuthError) {
 *     switch (error.errorType) {
 *       case AuthErrorType.TOKEN_EXPIRED:
 *         // Handle expired token - redirect to login
 *         break;
 *       case AuthErrorType.PAYLOAD_VALIDATION_FAILED:
 *         // Handle malformed payload - log security event
 *         console.log(error.validationErrors);
 *         break;
 *       case AuthErrorType.NOT_INITIALIZED:
 *         // Handle service not initialized
 *         break;
 *     }
 *   }
 * }
 * ```
 */
export class NaviAuthError extends NaviError {
  public readonly validationErrors?: any[];

  constructor(
    message: string,
    public readonly errorType: AuthErrorType = AuthErrorType.UNKNOWN_AUTH_ERROR,
    details?: Record<string, any>
  ) {
    super(message, `AUTH_${errorType}`, details);
    this.name = "NaviAuthError";

    // Extract validation errors if present
    if (details?.validationErrors) {
      this.validationErrors = details.validationErrors;
    }
  }

  /**
   * Create an authentication error for initialization failures
   */
  static notInitialized(
    message: string = "Auth service not initialized"
  ): NaviAuthError {
    return new NaviAuthError(message, AuthErrorType.NOT_INITIALIZED);
  }

  /**
   * Create an authentication error for initialization failures
   */
  static initializationFailed(error: any): NaviAuthError {
    return new NaviAuthError(
      "Failed to initialize auth service",
      AuthErrorType.INITIALIZATION_FAILED,
      { error }
    );
  }

  /**
   * Create an authentication error for invalid session data
   */
  static invalidSessionData(validationErrors?: any[]): NaviAuthError {
    return new NaviAuthError(
      "Invalid session token data",
      AuthErrorType.INVALID_SESSION_DATA,
      { validationErrors }
    );
  }

  /**
   * Create an authentication error for session token creation failures
   */
  static sessionTokenCreationFailed(error: any): NaviAuthError {
    return new NaviAuthError(
      "Failed to create session token",
      AuthErrorType.SESSION_TOKEN_CREATION_FAILED,
      { error }
    );
  }

  /**
   * Create an authentication error for JWT creation failures
   */
  static jwtCreationFailed(error: any): NaviAuthError {
    return new NaviAuthError(
      "Failed to create JWT from session",
      AuthErrorType.JWT_CREATION_FAILED,
      { error }
    );
  }

  /**
   * Create an authentication error for invalid tokens
   */
  static invalidToken(
    message: string = "Invalid or expired token",
    error?: any
  ): NaviAuthError {
    // Determine specific error type based on the underlying error
    let errorType = AuthErrorType.INVALID_TOKEN_FORMAT;

    if (error?.code === "ERR_JWT_EXPIRED") {
      errorType = AuthErrorType.TOKEN_EXPIRED;
    } else if (error?.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
      errorType = AuthErrorType.TOKEN_SIGNATURE_INVALID;
    }

    return new NaviAuthError(message, errorType, { error });
  }

  /**
   * Create an authentication error for payload validation failures
   */
  static payloadValidationFailed(validationErrors?: any[]): NaviAuthError {
    return new NaviAuthError(
      "Token payload validation failed",
      AuthErrorType.PAYLOAD_VALIDATION_FAILED,
      { validationErrors }
    );
  }

  /**
   * Create an authentication error for session conversion failures
   */
  static sessionConversionFailed(validationErrors?: any[]): NaviAuthError {
    return new NaviAuthError(
      "Invalid session data for JWT creation",
      AuthErrorType.SESSION_CONVERSION_FAILED,
      { validationErrors }
    );
  }

  /**
   * Create an authentication error for session token validation failures
   */
  static sessionTokenValidationFailed(validationErrors?: any[]): NaviAuthError {
    return new NaviAuthError(
      "Session token validation failed",
      AuthErrorType.INVALID_SESSION_FORMAT,
      { validationErrors }
    );
  }
}

/**
 * Network Error Class
 */
export class NaviNetworkError extends NaviError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "NETWORK_ERROR", details);
    this.name = "NaviNetworkError";
  }
}
