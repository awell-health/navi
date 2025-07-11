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
 * Authentication Error Class
 */
export class NaviAuthError extends NaviError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "AUTH_ERROR", details);
    this.name = "NaviAuthError";
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
