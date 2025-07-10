import { NaviError, NaviAuthError } from './types';

/**
 * Validates a publishable key format
 */
export function validatePublishableKey(key: string): boolean {
  return key.startsWith('pk_') && key.length > 10;
}

/**
 * Extracts environment from publishable key
 */
export function getEnvironmentFromKey(key: string): 'test' | 'live' | 'unknown' {
  if (key.startsWith('pk_test_')) return 'test';
  if (key.startsWith('pk_live_')) return 'live';
  return 'unknown';
}

/**
 * Generates a unique identifier
 */
export function generateId(prefix = 'navi'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates a URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a safe fetch wrapper with error handling
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new NaviError(
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        { status: response.status, statusText: response.statusText }
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof NaviError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new NaviError('Request timeout', 'TIMEOUT');
      }
      throw new NaviError(error.message, 'NETWORK_ERROR');
    }

    throw new NaviError('Unknown error occurred', 'UNKNOWN_ERROR');
  }
}

/**
 * Debounce function for rate limiting
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]!) as T[Extract<keyof T, string>];
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
} 