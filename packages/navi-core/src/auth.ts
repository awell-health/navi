import { jwtVerify, SignJWT } from 'jose';
import { NaviAuthError } from './types';
import { validatePublishableKey } from './utils';

/**
 * JWT-based authentication service
 */
export class AuthService {
  private secretKey: CryptoKey | null = null;

  constructor(private readonly secret?: string) {}

  /**
   * Initialize the auth service with a secret key
   */
  async initialize(secret?: string): Promise<void> {
    const secretToUse = secret || this.secret;
    
    if (!secretToUse) {
      throw new NaviAuthError('Secret key is required for JWT operations');
    }

    try {
      this.secretKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secretToUse),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );
    } catch (error) {
      throw new NaviAuthError('Failed to initialize auth service', { error });
    }
  }

  /**
   * Create a JWT token for a session
   */
  async createSessionToken(payload: Record<string, any>): Promise<string> {
    if (!this.secretKey) {
      throw new NaviAuthError('Auth service not initialized');
    }

    try {
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(this.secretKey);

      return token;
    } catch (error) {
      throw new NaviAuthError('Failed to create session token', { error });
    }
  }

  /**
   * Verify a JWT token
   */
  async verifyToken(token: string): Promise<Record<string, any>> {
    if (!this.secretKey) {
      throw new NaviAuthError('Auth service not initialized');
    }

    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      return payload as Record<string, any>;
    } catch (error) {
      throw new NaviAuthError('Invalid or expired token', { error });
    }
  }

  /**
   * Validate publishable key format and extract metadata
   * NOTE: This is a STUB implementation for basic format validation only.
   * The real auth service will validate against a database.
   * @see NaviAuthService in auth-service-stub.ts for the real implementation
   */
  validatePublishableKey(key: string): {
    isValid: boolean;
    environment: 'test' | 'live' | 'unknown';
    keyId?: string;
  } {
    // STUB: Basic format validation only (no database lookup)
    const isValid = validatePublishableKey(key);
    
    if (!isValid) {
      return { isValid: false, environment: 'unknown' };
    }

    const environment = key.startsWith('pk_test_') ? 'test' : 
                       key.startsWith('pk_live_') ? 'live' : 'unknown';
    
    const keyId = key.split('_').slice(2).join('_');

    return {
      isValid: true,
      environment,
      keyId,
    };
  }
} 