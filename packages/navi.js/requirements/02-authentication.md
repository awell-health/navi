# Authentication & Session Management

## 1. Magic-Link Flow

1. Patient clicks a link of shape  
   `https://<customer-domain>/magic?token=<opaqueToken>`
2. Edge Function `GET /magic`:
   - Decrypts token → `{patientId, careflowId, exp}`.
   - Inserts a `sessions` row: `sessionId`, `patientId`, `expiresAt`.
   - Generates **JWT**: `sub=sessionId`, `exp ≤ 15 min`.
   - Sets cookies
     - `awell.sid` – opaque sessionId, HttpOnly, SameSite=Lax, Secure, Domain=`customer-domain`
     - `awell.jwt` – JWT, HttpOnly, SameSite=Lax, Secure, Path=`/graphql`
   - Streams initial HTML shell (activity arrives later via subscription).

## 2. Token Refresh

- Background XHR to `/session/refresh` 2 min before expiry.  
  Returns new JWT and resets expiry cookies.

## 3. Security Requirements

- AES-GCM 256 for token encryption.
- No identifiers (sessionId, patientId) may appear in query strings after first redirect.
- Referrer-Policy: `strict-origin`.

## 4. Multi-domain Support

- Each customer provides CNAME → Vercel project.
- Edge function detects host header, looks up `orgId`, applies correct branding, i18n default, and cookie domain.

```mermaid
sequenceDiagram
    actor Patient
    participant EdgeFn as Vercel Edge<br/>/magic
    participant SessionStore as Session DB / KV
    participant Browser
    participant GQLGW as GraphQL Gateway<br/>(/graphql WS)
    participant Orchestrator as Orchestration API<br/>(GKE)

    %% 1. Patient follows magic link
    Patient->>EdgeFn: GET /magic?token={opaqueToken}
    EdgeFn->>EdgeFn: decrypt token & validate exp
    EdgeFn->>SessionStore: insert {sessionId, patientId, exp}
    EdgeFn->>EdgeFn: mint JWT (sub=sessionId, exp=15 min)
    EdgeFn--)Browser: streamed HTML +<br/>Set-Cookie: awell.sid, awell.jwt
    note right of Browser: First Contentful Paint<br/>(shell + inline CSS)

    %% 2. Hydration & WS
    Browser->>GQLGW: WebSocket connect<br/>Sec-WebSocket-Protocol: bearer, <JWT>
    GQLGW->>SessionStore: lookup sessionId (from JWT sub)
    alt valid & not expired
        GQLGW-->>Browser: connection_ack
        Browser->>GQLGW: start `nextActivity` sub
        GQLGW->>Orchestrator: subscribe nextActivity(sessionId)
        Orchestrator-->>GQLGW: activity descriptor
        GQLGW-->>Browser: nextActivity message
        Browser->>Browser: dynamic import(componentKey)
    else any error
        GQLGW-->>Browser: error → client falls back to /poll
    end

    %% 3. Silent refresh
    loop every 13 min
        Browser->>EdgeFn: POST /session/refresh (Cookie: awell.sid)
        EdgeFn->>SessionStore: check & extend exp
        EdgeFn-->>Browser: Set-Cookie: awell.jwt (new)
    end
```
