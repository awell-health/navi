// Authentication types
export interface AuthConfig {
  publishableKey: string;
  apiUrl?: string;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
}

// Activity types
export interface Activity {
  id: string;
  type: string;
  status: 'active' | 'completed' | 'expired';
  data?: Record<string, any>;
}

// Flow types
export interface Flow {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
}

// Event types
export interface NaviEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

// Configuration types
export interface NaviClientConfig {
  publishableKey: string;
  apiUrl?: string;
  debug?: boolean;
  timeout?: number;
}

// Error types
export class NaviError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'NaviError';
  }
}

export class NaviAuthError extends NaviError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'NaviAuthError';
  }
}

export class NaviNetworkError extends NaviError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NaviNetworkError';
  }
} 