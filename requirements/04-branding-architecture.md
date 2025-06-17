# Branding Architecture Implementation

## Overview

This implementation follows the architecture requirements where:
- **Edge Config**: Read-only branding configurations (<20ms latency budget)
- **KV**: Session storage and dynamic data (100-200ms latency)

## Data Flow

### Magic Token Route (Edge Runtime)
```
/magic/[token] → getBrandingByOrgId(orgId) → Edge Config (primary) → KV (fallback) → Defaults
```

### Layout (Node.js Runtime)  
```
layout.tsx → getBrandingAction() → getBrandingByOrgId(orgId) → Edge Config (primary) → KV (fallback) → Defaults
```

## Implementation Details

### 1. Branding Service (`/lib/branding/branding-service.ts`)
- **Primary**: Tries Edge Config first (production setup)
- **Fallback**: Falls back to KV store (development/prototype)
- **Default**: Uses Awell default branding if neither source has data
- **Performance**: Logs latency and warns if Edge Config exceeds 20ms budget

### 2. Edge Config Store (`/lib/branding/edge-config-branding-store.ts`)
- Read-only access to Vercel Edge Config
- Sub-20ms latency budget
- Data format: `org:${orgId}` → `OrgBranding` object
- Deploy-time updates only

### 3. KV Store (`/lib/branding/branding-store.ts`)
- Fallback for development/prototype
- Read-write access for dynamic branding updates
- Used for seeding sample data
- Data format: `branding:${orgId}` → `OrgBranding['branding']` object

### 4. Server Action (`/lib/actions/branding.ts`)
- Cached with React's `cache()` function
- Fetches branding using unified service
- Returns complete CSS + metadata for layout

## Configuration

### Edge Config Data Structure
```json
{
  "org:awell-dev": {
    "orgId": "awell-dev",
    "branding": {
      "primary": "#1d4ed8",
      "background": "#ffffff",
      "fontFamilyBody": "Inter, sans-serif",
      // ... other branding properties
    }
  }
}
```

### Environment Variables
- `EDGE_CONFIG_URL`: Vercel Edge Config connection string
- `KV_REST_API_URL`: Vercel KV connection (fallback)

## Benefits

✅ **Performance**: <20ms branding lookups for magic token route  
✅ **Consistency**: Both edge and layout use same branding data  
✅ **Fallback**: Graceful degradation from Edge Config → KV → Defaults  
✅ **Architecture Compliance**: Edge Config for static configs, KV for dynamic data  
✅ **Caching**: Server actions cached to prevent redundant fetches  

## Usage

Both access patterns use the same underlying service:

```typescript
// Magic token route (edge)
const branding = await getBrandingByOrgId(orgId);

// Layout (server action)
const { branding } = await getBrandingAction();
```

The service automatically selects the best data source and falls back gracefully.