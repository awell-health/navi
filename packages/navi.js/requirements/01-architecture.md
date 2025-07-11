# System Architecture Requirements

## 1. Runtime Model

- The browser receives **edge-rendered HTML** containing:
  - Minimal chrome (header, footer, empty activity slot).
  - Inlined critical CSS derived from org branding.
- A **GraphQL WS** connection streams `nextActivity` messages.  
  Each message includes:
  - `activityId`
  - `componentKey` – matches an ES module chunk name
  - `componentProps` – JSON payload

## 2. Component Loading

- Use **dynamic `import()`** or Module Federation to fetch the activity chunk only when first needed.
- Cache-control headers must allow immutable caching for 1 year on activity chunks.

## 3. Data Sources

| Source                           | Latency budget | Notes                                               |
| -------------------------------- | -------------- | --------------------------------------------------- |
| Edge Config (branding, manifest) | ≤ 20 ms        | Replicated to US-EAST1, EU-WEST1, LON1              |
| Next-Activity service            | ≤ 50 ms        | May be piggy-backed onto session-creation edge call |

## 4. Error Surfaces

- Show an inline skeleton + retry button if component import fails.
- Fallback polling (REST) if WebSocket cannot establish within 5 s.

## 5. Service Boundaries

- **Edge Functions (Vercel):** token validation, session creation, JWT minting, branding + manifest lookup, and first‑activity pre‑fetch. Stateless; target < 100 ms execution.
- **GraphQL Gateway (`/graphql`):** persistent WebSocket endpoint that validates the JWT, multiplexes queries and subscriptions, and proxies to backend micro‑services.
- **Activity Assets CDN:** immutable ES‑module chunks and media referenced by `componentKey`, cached globally via Vercel's edge network.
- **Next‑Activity Service:** given a `sessionId`, resolves the next activity descriptor. Co‑locate with the session datastore to avoid an extra hop.
- **Branding Config Store:** Vercel Edge Config (read-only, edge-replicated) where each `orgId` maps to a branding blob.

## 5.1. Data Storage Strategy

### Vercel Edge Config vs KV

| Service        | **Vercel Edge Config**    | **Vercel KV**              |
| -------------- | ------------------------- | -------------------------- |
| **Operations** | Read-only                 | Read + Write               |
| **Latency**    | <50ms (edge-replicated)   | ~100-200ms (single region) |
| **Updates**    | Deploy-time configuration | Real-time programmatic     |
| **Use Cases**  | Static configs, branding  | Sessions, dynamic caching  |

#### Current Implementation:

- **Edge Config**: Organization branding configurations (meets ≤20ms latency budget)
- **KV**: Session storage and API response caching (planned for future implementation)

#### Why Both Services:

- **Edge Config** provides ultra-fast, immutable branding lookups critical for FCP performance
- **KV** handles dynamic, frequently-changing data like user sessions and temporary caches
- Separation ensures optimal performance characteristics for each data type

## 6. Typical Request Flow

1. **Magic‑link request** → `/magic` edge function
2. Edge function responds with streamed HTML shell and sets auth cookies
3. Browser hydrates and opens a WebSocket to `/graphql`
4. Gateway authenticates the JWT and starts `nextActivity` subscription
5. Client receives the descriptor, `import()`s the matching component chunk from CDN, and renders it

## 7. Open Questions

- Should the GraphQL gateway also expose i18n content queries?
- Do we co‑locate the Next‑Activity service with the session DB or run it as a separate function?
- What circuit‑breaker strategy do we need on the client if the WebSocket repeatedly fails?
