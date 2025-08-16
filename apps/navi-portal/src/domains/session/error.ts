export class SessionError extends Error {
  code: SessionErrorCode;
  constructor(code: SessionErrorCode, message?: string) {
    super(message ?? code);
    this.name = "SessionError";
    this.code = code;
  }
}

export enum SessionErrorCode {
  NO_SESSION_FOUND = "NO_SESSION_FOUND",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_SESSION_TYPE = "INVALID_SESSION_TYPE",
  SESSION_IN_ERROR_STATE = "SESSION_IN_ERROR_STATE",
}
