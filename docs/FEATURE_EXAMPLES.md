# Feature Implementation Examples

This document contains examples of where different features should be implemented in the Navi monorepo architecture, based on the Stripe-like SDK design.

## Package Quick Reference

- **`navi-core`**: Shared utilities, TypeScript types, authentication services
- **`navi-portal`**: Embed application (Vercel deployment, handles GraphQL, JWT)  
- **`navi-loader`**: JavaScript SDK (CDN bundle, creates iframes)
- **`navi-js`**: NPM wrapper (loads CDN script)
- **`navi-react`**: React components and hooks

---

## Example 1: Authentication & Component Parameters

**Question**: Feature where only publishable keys should be used in NaviProvider, and ActivitiesLoader component takes required `stakeholder_id`, plus optional `careflow_id`, `activity_id`, or `track_id`.

**Answer**: **`navi-core` + `navi-react` + `navi-portal`**

**Why**: 
- `navi-core`: Key validation logic (publishable vs secret key detection) and TypeScript types
- `navi-react`: NaviProvider component (with key validation) and ActivitiesLoader component  
- `navi-portal`: Updated embed routes/API to accept the new parameters via URL params or postMessage

**Key Insight**: Can't be client-side only - need iframe communication layer for parameters.

---

## Example 2: Backend Authentication Changes

**Question**: Change the way we're signing JWT to communicate with orchestration API.

**Answer**: **`navi-portal`**

**Why**: JWT signing happens server-side in the embed application when authenticating with orchestration API. The portal is the only component that directly communicates with backend APIs - client-side packages communicate with portal via iframe/postMessage.

**Key Insight**: Only the portal talks directly to backend APIs.

---

## Example 3: Infrastructure Logging

**Question**: Add logging to better capture events as the embedded iframe is being mounted.

**Answer**: **`navi-loader`** (and potentially **`navi-portal`**)

**Why**: Iframe mounting happens in the JavaScript SDK that creates and manages iframe elements on the customer's page. `navi-loader` handles iframe creation, so mounting events are captured there. `navi-portal` might log when iframe content loads, but "mounting" refers to iframe DOM element creation.

**Key Insight**: Mounting = DOM creation by CDN script, not content loading.

---

## Example 4: Real-time Data Updates

**Question**: Use GraphQL subscriptions to capture updated activity data in a robust fashion.

**Answer**: **`navi-portal`**

**Why**: GraphQL subscriptions for activity data are implemented in the embed application where the GraphQL client lives. Portal handles orchestration API communication and activity state management. Client-side packages communicate with portal via postMessage, not directly with GraphQL APIs.

**Key Insight**: Only portal has GraphQL client and API access.

---

## Example 5: Monolithic Component Experience

**Question**: Create a "checkout"-like experience (vs "Stripe Elements" experience) - single React component for full care flow lifecycle.

**Answer**: **`navi-react`**

**Why**: High-level React component providing complete care flow experience (like Stripe's `<CheckoutForm>` vs individual `<CardElement>` components). Lives in React package, communicates with portal via iframe/postMessage for lifecycle management. Shared types for care flow lifecycle might go in `navi-core`.

**Key Insight**: Monolithic = single high-level component with full lifecycle.

---

## Example 6: Granular Component Experience

**Question**: Create POC of "Stripe Elements" experience with granular control over components (e.g. activity list sidebar).

**Answer**: **`navi-react`**

**Why**: Granular React components (like Stripe's `<CardElement>`, `<PaymentElement>`) that developers can compose together. Activity list sidebar, individual form components, progress indicators, etc. are individual React components giving fine-grained control over UI layout and composition.

**Key Insight**: Granular = individual composable components.

---

## Example 7: Cross-Package Communication

**Question**: How would granular components react to GraphQL subscriptions that normally live in navi-portal?

**Answer**: **`navi-react` + `navi-portal`** with **postMessage communication**

**Why**: GraphQL subscriptions remain in `navi-portal`, but granular React components in `navi-react` establish postMessage communication with portal to receive real-time updates. Portal broadcasts subscription data changes via postMessage, React components listen and update local state.

**Key Insight**: Maintain security boundary while enabling real-time updates across iframe boundary.

---

## Architecture Patterns

### 1. **Client-Side Features** → `navi-react` or `navi-loader`
- UI components, user interactions, DOM manipulation

### 2. **Shared Logic** → `navi-core`  
- Authentication utilities, TypeScript types, common validation

### 3. **Server-Side Features** → `navi-portal`
- API communication, JWT handling, GraphQL operations

### 4. **Cross-Origin Communication** → **Multiple packages**
- Usually involves portal + client-side packages with postMessage bridge

### 5. **Infrastructure/Deployment** → **Build processes**
- CDN deployment, environment configuration, monitoring 