# Navi SDK Authentication Flow

## Overview

The Navi SDK uses a three-tier authentication system designed for secure, cross-origin embed functionality. This document explains the high-level flow without technical implementation details.

## Key Components

### 1. Publishable Key

- **Purpose**: Identifies the customer organization
- **Format**: `pk_test_orgabc123` or `pk_live_orgabc123`
- **Safety**: Safe to use in frontend code (like Stripe's publishable keys)
- **Usage**: Provided by customers in their SDK initialization

### 2. Session Token

- **Purpose**: Encrypted payload containing care flow session information
- **Format**: Long encrypted string passed as URL parameter
- **Security**: Contains encrypted patient/care flow data, expires after set time, single-use
- **Usage**: Generated server-side, used to establish embed sessions

### 3. JWT (JSON Web Token)

- **Purpose**: API authentication for GraphQL calls
- **Format**: Standard JWT format
- **Security**: HttpOnly cookie, domain-restricted
- **Usage**: Automatically included in API requests from embed

## Authentication Flow

### New Care Flow Creation

```
Customer Website → SDK → navi-portal → Awell API → Embed
```

**Step 1: SDK Initialization**

- Customer initializes SDK with publishable key
- SDK validates key format and origin

**Step 2: Session Creation Request**

- SDK calls navi-portal API with publishable key + care flow parameters
- navi-portal validates publishable key against organization database
- navi-portal calls Awell API to create/validate care flow

**Step 3: Token Generation**

- navi-portal creates encrypted session token containing:
  - Organization ID
  - Care flow ID
  - Patient ID
  - Expiration time
  - Navigation context (track/activity IDs if provided)

**Step 4: Embed Redirect**

- SDK redirects to embed URL with encrypted token as parameter
- Example: `/embed/start?token=encrypted_session_data`

**Step 5: Session Establishment**

- Embed route decrypts token to extract session information
- Creates JWT for API authentication
- Sets secure cookies for ongoing session
- Renders care flow interface

### Existing Care Flow Resume

```
Customer Website → SDK → navi-portal → Embed
```

**Similar flow but with different parameters:**

- Uses existing `careflowId` instead of creating new one
- May include navigation parameters (`trackId`, `activityId`)
- Token contains resume context rather than creation context

## Security Model

### Publishable Key Security

- **Not Secret**: Safe to expose in frontend code
- **Origin Restricted**: Validated against allowed domains
- **Rate Limited**: Prevents abuse of care flow creation
- **Organization Scoped**: Only accesses that organization's resources

### Session Token Security

- **Encrypted**: Uses AES-GCM encryption with rotating keys
- **Short-Lived**: Expires within hours of creation
- **Single Use**: Consumed when establishing embed session
- **Tamper Proof**: Invalid if modified in transit

### JWT Security

- **HttpOnly**: Cannot be accessed by JavaScript
- **Domain Restricted**: Only sent to API endpoints
- **Time Limited**: Expires based on session duration
- **Signed**: Cryptographically verified by API

## Data Flow

### What's In Each Token

**Publishable Key Contains:**

- Organization identifier
- Environment (test/live)
- Basic validation data

**Session Token Contains (Encrypted):**

- Organization ID
- Care flow ID
- Patient ID (anonymous or identified)
- Session expiration
- Navigation context
- Stakeholder ID (if specified)

**JWT Contains:**

- Organization ID
- Tenant ID
- Patient ID
- Session ID
- Stakeholder ID
- Authorization scopes
- Standard JWT claims (exp, iat, etc.)

## Error Handling

### Invalid Publishable Key

- SDK shows user-friendly error
- No sensitive information exposed
- Logs event for customer debugging

### Expired Session Token

- Embed shows "session expired" message
- Option to restart flow
- Secure cleanup of partial session data

### API Authentication Failure

- Graceful degradation of functionality
- Clear error messages for debugging
- Automatic retry mechanisms where appropriate

## Development vs Production

### Development Environment

- Uses `pk_test_` prefixed keys
- More permissive CORS policies
- Enhanced logging for debugging
- Shorter token expiration for testing

### Production Environment

- Uses `pk_live_` prefixed keys
- Strict security policies
- Minimal logging (no sensitive data)
- Production-appropriate token lifetimes

## Benefits of This Approach

### For Customers

- **Simple Integration**: Only need publishable key to get started
- **Secure by Default**: No sensitive data in frontend code
- **Flexible**: Supports both new and existing care flows
- **Familiar**: Similar to Stripe's authentication model

### For Navi Platform

- **Scalable**: Stateless token-based authentication
- **Secure**: Multiple layers of encryption and validation
- **Auditable**: Full trail of authentication events
- **Maintainable**: Clear separation of concerns

### For Patients

- **Seamless**: No additional login required
- **Private**: Session data encrypted in transit
- **Reliable**: Robust error handling and recovery
- **Fast**: Optimized for quick embed loading

## Development Setup

### Available Development Keys

For testing and development, use these pre-configured publishable keys:

**Awell Development Organization:**

- Key: `pk_test_awell_dev_123`
- Organization: `awell-dev`
- Allowed domains: `localhost:3000`, `localhost:3001`, `127.0.0.1:3000`, `127.0.0.1:3001`

**Customer Demo Organization:**

- Key: `pk_test_customer_demo_456`
- Organization: `customer-demo`
- Allowed domains: `localhost:3000`, `localhost:3001`, `demo.customer.com`

**Healthcare Organization:**

- Key: `pk_test_healthcare_org_789`
- Organization: `healthcare-org`
- Allowed domains: `localhost:3000`, `localhost:3001`, `portal.healthcare-org.com`

### Example Usage

```javascript
// Initialize SDK with development key
const navi = Navi("pk_test_awell_dev_123");

// Start new care flow
navi.render("#container", {
  careflowDefinitionId: "cf_def_patient_intake",
});

// Resume existing care flow
navi.render("#container", {
  careflowId: "cf_running_123",
  trackId: "track_456",
});
```

### Testing Different Organizations

Each publishable key maps to different organization branding and settings:

- `pk_test_awell_dev_123` → Awell default branding
- `pk_test_customer_demo_456` → Customer demo branding
- `pk_test_healthcare_org_789` → Healthcare organization branding

## Implementation Status

### Currently Working

- ✅ Session token encryption/decryption
- ✅ JWT generation and validation
- ✅ Embed route authentication
- ✅ Publishable key validation with in-memory store
- ✅ Organization mapping from publishable keys
- ✅ Origin validation for security
- ✅ Shared types in navi-core package
- ✅ Stakeholder-based activity filtering
- ✅ Authentication state tracking

### In Development

- 🟡 Rate limiting and abuse prevention
- 🟡 Enhanced error handling
- 🟡 Production-grade key management
- 🟡 Awell API integration for care flow creation

### Future Enhancements

- 🔴 Database-backed publishable key store
- 🔴 Advanced rate limiting
- 🔴 Key rotation mechanisms
- 🔴 Enhanced audit logging
- 🔴 Multi-region support
