# @awell-health/navi-core

> Core utilities, types, and authentication for Navi care flow integration

[![npm version](https://badge.fury.io/js/@awell-health%2Fnavi-core.svg)](https://www.npmjs.com/package/@awell-health/navi-core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@awell-health/navi-core)](https://bundlephobia.com/package/@awell-health/navi-core)

## What is this package?

This is the **core utilities package** for Navi. It provides the foundational building blocks that power both the loader script and React SDK. Think of it as the "engine" that other Navi packages use under the hood.

**Key features:**
- 🔐 **JWT Authentication** - Session management and token validation
- 🛡️ **Security Utilities** - Key validation, origin checking, safe networking
- 📝 **TypeScript Types** - Comprehensive type definitions for all Navi concepts
- 🔧 **Helper Functions** - Common utilities for validation, networking, and data handling
- ⚡ **25KB bundle size** - Lightweight foundation for other packages
- 🎯 **Zero dependencies** - Self-contained with minimal external deps

## When to use this package?

**You might want `@awell-health/navi-core` if:**
- ✅ You're building custom Navi integrations (not React/vanilla JS)
- ✅ You need server-side JWT validation for Navi sessions
- ✅ You want to build your own framework-specific wrappers
- ✅ You need the TypeScript types for Navi concepts
- ✅ You're contributing to the Navi ecosystem

**Most users should use instead:**
- [`@awell-health/navi`](../navi-loader) - For vanilla JS/HTML integration
- [`@awell-health/navi-react`](../navi-react) - For React applications

## 🔑 Authentication Services Explained

This package contains **TWO** authentication implementations:

### **1. NaviAuthService** (The Real One) ⭐
- **Purpose**: Production-ready auth service with publishable key validation
- **Database**: Will validate keys against real organization database
- **Security**: Includes rate limiting, origin validation, audit logging
- **JWT Claims**: Rich claims for Kong gateway integration
- **Use Case**: This becomes the actual Navi auth microservice

### **2. AuthService** (Legacy Utils)
- **Purpose**: Basic JWT signing/verification utilities
- **Database**: No database - just signs/verifies any payload
- **Security**: Basic - no rate limiting or validation
- **JWT Claims**: Simple - whatever you pass in
- **Use Case**: Internal utilities, backwards compatibility

**When to use which:**
- ✅ **Use `NaviAuthService`** for publishable key → JWT exchange
- ✅ **Use `AuthService`** for basic JWT operations (signing session data, etc.)

## Installation

```bash
npm install @awell-health/navi-core
# or
yarn add @awell-health/navi-core
# or
pnpm add @awell-health/navi-core
```

## Quick Start

### Authentication Service

**NEW: Real Auth Service (Recommended)**

```javascript
import { NaviAuthService, createAuthService } from '@awell-health/navi-core';

// Create the real auth service (will become a microservice)
const authService = createAuthService({
  jwtSecret: process.env.NAVI_JWT_SECRET!,
  environment: 'development'
});

// Exchange publishable key for JWT token (main use case)
const response = await authService.exchangePublishableKey({
  publishable_key: 'pk_test_abc123',
  origin: 'http://localhost:3000'
});

console.log('JWT Token:', response.access_token);
console.log('Expires in:', response.expires_in, 'seconds');

// Verify JWT token (used by Kong gateway)
const claims = await authService.verifyJWT(response.access_token);
console.log('Token claims:', claims);
```

**Legacy: Basic JWT Utils (Backwards Compatibility)**

```javascript
import { AuthService } from '@awell-health/navi-core';

// NOTE: This is a basic JWT utility class, not the real auth service
const auth = new AuthService();
await auth.initialize(process.env.NAVI_SECRET_KEY);

// Create a basic session token
const sessionToken = await auth.createSessionToken({
  patientId: 'patient_123',
  organizationId: 'org_456'
});

// Verify a token
const payload = await auth.verifyToken(sessionToken);
```

### Validation Utilities

```javascript
import { 
  validatePublishableKey, 
  getEnvironmentFromKey,
  isValidUrl 
} from '@awell-health/navi-core';

// Validate publishable keys
const isValid = validatePublishableKey('pk_test_abc123');
console.log(isValid); // true

// Get environment from key
const env = getEnvironmentFromKey('pk_test_abc123');
console.log(env); // 'test'

// URL validation
const validUrl = isValidUrl('https://api.awell.com');
console.log(validUrl); // true
```

### Error Handling

```javascript
import { 
  NaviError, 
  NaviAuthError, 
  NaviNetworkError 
} from '@awell-health/navi-core';

// Custom error types with structured data
try {
  throw new NaviAuthError('Invalid publishable key', {
    key: 'pk_invalid',
    suggestion: 'Check your key format'
  });
} catch (error) {
  if (error instanceof NaviAuthError) {
    console.log('Auth error:', error.message);
    console.log('Details:', error.details);
  }
}
```

### Safe Networking

```javascript
import { safeFetch } from '@awell-health/navi-core';

try {
  const response = await safeFetch('https://api.awell.com/health', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' }
  }, 5000); // 5 second timeout
  
  const data = await response.json();
  console.log('API response:', data);
} catch (error) {
  // Handles timeouts, network errors, HTTP errors
  console.error('Request failed:', error.message);
}
```

## API Reference

### Authentication

#### `AuthService`

JWT-based authentication service for secure session management.

```javascript
import { AuthService } from '@awell-health/navi-core';

const auth = new AuthService(secretKey); // optional constructor param
```

**Methods:**

```javascript
// Initialize with secret key
await auth.initialize(secretKey?: string): Promise<void>

// Create session token
await auth.createSessionToken(payload: object): Promise<string>

// Verify and decode token
await auth.verifyToken(token: string): Promise<object>

// Validate publishable key format
auth.validatePublishableKey(key: string): {
  isValid: boolean;
  environment: 'test' | 'live' | 'unknown';
  keyId?: string;
}
```

### Validation Utilities

```javascript
import { 
  validatePublishableKey,
  getEnvironmentFromKey,
  isValidUrl,
  generateId
} from '@awell-health/navi-core';

// Key validation
validatePublishableKey(key: string): boolean
getEnvironmentFromKey(key: string): 'test' | 'live' | 'unknown'

// URL validation  
isValidUrl(url: string): boolean

// ID generation
generateId(prefix?: string): string
```

### Networking

```javascript
import { safeFetch, debounce } from '@awell-health/navi-core';

// Safe fetch with timeout and error handling
safeFetch(
  url: string, 
  options?: RequestInit, 
  timeout?: number
): Promise<Response>

// Debounce function calls
debounce<T>(func: T, wait: number): (...args) => void
```

### Error Classes

```javascript
import { 
  NaviError, 
  NaviAuthError, 
  NaviNetworkError 
} from '@awell-health/navi-core';

// Base error class
new NaviError(message: string, code?: string, details?: object)

// Authentication errors
new NaviAuthError(message: string, details?: object)

// Network/API errors  
new NaviNetworkError(message: string, details?: object)
```

### TypeScript Types

```typescript
import type {
  // Configuration
  NaviClientConfig,
  AuthConfig,
  
  // Data types
  Activity,
  Flow,
  AuthToken,
  NaviEvent,
  
  // Error types
  NaviError,
  NaviAuthError,
  NaviNetworkError
} from '@awell-health/navi-core';

// Usage in your code
const config: NaviClientConfig = {
  publishableKey: 'pk_test_123',
  apiUrl: 'https://api.awell.com',
  debug: true,
  timeout: 10000
};

const activity: Activity = {
  id: 'activity_123',
  type: 'form',
  status: 'active',
  data: { question: 'How are you feeling?' }
};
```

## Usage Examples

### Server-Side Session Management

```javascript
// Express.js middleware example
import { AuthService, NaviAuthError } from '@awell-health/navi-core';

const auth = new AuthService();
await auth.initialize(process.env.NAVI_SECRET);

app.post('/api/create-session', async (req, res) => {
  try {
    const { patientId, flowId } = req.body;
    
    const sessionToken = await auth.createSessionToken({
      patientId,
      flowId,
      organizationId: req.user.organizationId,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    
    res.json({ sessionToken });
  } catch (error) {
    if (error instanceof NaviAuthError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

### Custom Framework Integration

```javascript
// Building a Vue.js plugin
import { 
  validatePublishableKey, 
  NaviError,
  safeFetch 
} from '@awell-health/navi-core';

class NaviVuePlugin {
  constructor(publishableKey) {
    if (!validatePublishableKey(publishableKey)) {
      throw new NaviError('Invalid publishable key format');
    }
    this.publishableKey = publishableKey;
  }
  
  async loadFlow(flowId) {
    try {
      const response = await safeFetch(`/api/flows/${flowId}`, {
        headers: {
          'X-Publishable-Key': this.publishableKey
        }
      });
      return response.json();
    } catch (error) {
      throw new NaviError(`Failed to load flow: ${error.message}`);
    }
  }
}

// Vue plugin registration
export default {
  install(app, { publishableKey }) {
    const navi = new NaviVuePlugin(publishableKey);
    app.config.globalProperties.$navi = navi;
    app.provide('navi', navi);
  }
};
```

### API Client with Error Handling

```javascript
import { 
  safeFetch, 
  NaviNetworkError,
  NaviAuthError,
  debounce 
} from '@awell-health/navi-core';

class NaviApiClient {
  constructor(publishableKey, baseUrl = 'https://api.navi.awell.com') {
    this.publishableKey = publishableKey;
    this.baseUrl = baseUrl;
    
    // Debounced error reporting
    this.reportError = debounce(this._reportError.bind(this), 1000);
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.publishableKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    try {
      const response = await safeFetch(url, requestOptions, 10000);
      return response.json();
    } catch (error) {
      // Enhanced error handling
      if (error.code === 'HTTP_ERROR' && error.details?.status === 401) {
        const authError = new NaviAuthError('Authentication failed', {
          publishableKey: this.publishableKey,
          endpoint
        });
        this.reportError(authError);
        throw authError;
      }
      
      if (error.code === 'TIMEOUT' || error.code === 'NETWORK_ERROR') {
        const networkError = new NaviNetworkError('Network request failed', {
          endpoint,
          originalError: error.message
        });
        this.reportError(networkError);
        throw networkError;
      }
      
      throw error;
    }
  }
  
  _reportError(error) {
    // Send error reports to monitoring service
    console.error('Navi API Error:', error);
  }
}
```

### Form Validation with Types

```typescript
import type { Activity } from '@awell-health/navi-core';
import { validatePublishableKey } from '@awell-health/navi-core';

interface FormSubmission {
  activityId: string;
  responses: Record<string, any>;
  metadata?: Record<string, any>;
}

class ActivityValidator {
  static validateSubmission(
    activity: Activity, 
    submission: FormSubmission
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!activity.id || activity.id !== submission.activityId) {
      errors.push('Activity ID mismatch');
    }
    
    if (activity.status !== 'active') {
      errors.push('Cannot submit to inactive activity');
    }
    
    if (!submission.responses || Object.keys(submission.responses).length === 0) {
      errors.push('No responses provided');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## Advanced Usage

### Custom Event System

```javascript
import { generateId } from '@awell-health/navi-core';

class NaviEventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    const id = generateId('listener');
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Map());
    }
    this.listeners.get(event).set(id, callback);
    
    return () => this.off(event, id); // Return unsubscribe function
  }
  
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event listener error for ${event}:`, error);
        }
      });
    }
  }
  
  off(event, listenerId) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listenerId);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }
}
```

## Browser/Node.js Support

- **Node.js**: 16+ (for server-side auth)
- **Browsers**: Modern browsers (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- **TypeScript**: 4.5+

## Bundle Analysis

| Export | Size | Purpose |
|--------|------|---------|
| `AuthService` | ~8KB | JWT authentication |
| `Types` | ~1KB | TypeScript definitions |
| `Utilities` | ~12KB | Validation, networking |
| `Error Classes` | ~2KB | Structured error handling |
| **Total** | ~23KB | Complete package |

## Security Considerations

- **Server-side only**: Never use secret keys in browser code
- **Publishable keys**: Safe for frontend use, limited scope
- **Token expiration**: Set appropriate JWT expiration times
- **Origin validation**: Built into networking utilities
- **Input validation**: Always validate user inputs

## Contributing

This package is part of the Navi monorepo. See the [main README](../../README.md) for contribution guidelines.

## Support

- 📖 [Documentation](https://docs.navi.awell.com/core)
- 💬 [Community Support](https://github.com/awell-health/navi/discussions)
- 🐛 [Report Issues](https://github.com/awell-health/navi/issues)

## License

MIT 