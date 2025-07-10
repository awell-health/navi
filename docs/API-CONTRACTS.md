# API Contracts & Version Compatibility

**🚧 DEVELOPMENT PHASE (v0.x.x)**: Breaking changes are acceptable but require coordination and documentation. This document tracks interfaces and guides compatibility decisions during development.

This document defines the API contracts between packages and tracks breaking changes. **All breaking changes must be documented here BEFORE implementation.**

## 🔗 Package Dependency Flow

```
navi-core (1.x.x)
    ↓
navi-portal (1.x.x) ──→ Embed API Contract
    ↓                           ↓
navi-loader (1.x.x) ←──────────┘
    ↓
navi-js (1.x.x) ──→ CDN Version Mapping
    ↓
Customer Applications
```

## 📋 Current API Contracts

**NOTE**: During v0.x.x development, these contracts are evolving. Breaking changes require coordination but are expected as we finalize the architecture.

### **Embed API Contract** (`navi-portal` → `navi-loader`)

**Version:** 0.1.0  
**Status:** 🚧 In Development  
**Last Updated:** 2024-01-XX

#### **Route Signature**
```typescript
GET /embed/[pathway_id]?pk={publishableKey}&instance_id={instanceId}&org_id={orgId}&user_id={userId}&session_id={sessionId}&stakeholder_id={stakeholderId}&branding={encodedJSON}
```

#### **Required Parameters**
- `pathway_id` (path): Unique pathway identifier
- `pk` (query): Publishable key for authentication
- `instance_id` (query): Unique instance identifier for postMessage targeting

#### **Optional Parameters**
- `org_id` (query): Organization identifier for JWT aud claim
- `user_id` (query): User identifier for JWT sub claim  
- `session_id` (query): Session tracking identifier
- `stakeholder_id` (query): Stakeholder identifier
- `branding` (query): URL-encoded JSON branding configuration

#### **PostMessage Events** (iframe → parent)
```typescript
interface NaviEmbedMessage {
  source: 'navi';
  instance_id: string;
  type: 'navi.ready' | 'navi.activity.completed' | 'navi.pathway.completed' | 'navi.height.changed' | 'navi.error';
  [key: string]: any; // Event-specific data
}
```

#### **Breaking Change Rules** (v0.x.x Development)
- 🚧 **Can remove** required parameters (with coordination)
- 🚧 **Can change** parameter types or validation (with coordination)
- 🚧 **Can remove** postMessage event types (with coordination)
- 🚧 **Can change** event data structure (with coordination)
- ✅ **Can add** optional parameters  
- ✅ **Can add** new event types
- ✅ **Can add** fields to event data
- **ALWAYS**: Coordinate changes across affected packages
- **ALWAYS**: Test full integration flow before merging

---

### **CDN Loader API Contract** (`navi-loader` → Customer)

**Version:** 0.1.0  
**Status:** 🚧 In Development  
**Last Updated:** 2024-01-XX

#### **Global API**
```typescript
declare global {
  interface Window {
    Navi: (publishableKey: string) => NaviInstance;
  }
}

interface NaviInstance {
  renderActivities: (containerId: string, options: RenderOptions) => NaviEmbedInstance;
}
```

#### **Render Options**
```typescript
interface RenderOptions {
  pathwayId: string;
  stakeholderId?: string;
  organizationId?: string;
  userId?: string;
  sessionId?: string;
  branding?: BrandingConfig;
  size?: 'compact' | 'standard' | 'full' | 'custom';
  height?: number;
  width?: string;
}
```

#### **Embed Instance API**
```typescript
interface NaviEmbedInstance {
  destroy: () => void;
  iframe: HTMLIFrameElement;
  on: (event: string, callback: (data: any) => void) => void;
}
```

#### **Event Types**
- `navi.ready`: Iframe loaded and ready
- `navi.activity.loaded`: New activity displayed
- `navi.activity.completed`: User completed activity
- `navi.pathway.completed`: Full pathway completed
- `navi.error`: Error occurred

#### **Breaking Change Rules** (v0.x.x Development)
- 🚧 **Can change** `window.Navi` global (with coordination)
- 🚧 **Can change** method signatures (with coordination)
- 🚧 **Can remove** required options (with coordination)
- 🚧 **Can remove** event types (with coordination)
- 🚧 **Can change** iframe behavior (with coordination)
- ✅ **Can add** optional options
- ✅ **Can add** new event types
- ✅ **Can add** new methods to instances
- **ALWAYS**: Coordinate changes across packages

---

### **NPM Wrapper API Contract** (`navi-js` → Customer)

**Version:** 0.1.0  
**Status:** 🚧 In Development  
**Last Updated:** 2024-01-XX

#### **Export API**
```typescript
export declare function loadNavi(publishableKey: string): Promise<NaviInstance | null>;
```

#### **Return Type**
```typescript
interface NaviInstance {
  renderActivities: (containerId: string, options: RenderOptions) => NaviEmbedInstance;
}
```

#### **CDN Version Mapping**
```typescript
// Internal - maps NPM version to CDN version
const CDN_VERSION_MAP = {
  '1.0.0': 'v1.0.0',
  '1.1.0': 'v1.1.0', 
  '1.2.0': 'v1.2.0'
};
```

#### **Breaking Change Rules** (v0.x.x Development)
- 🚧 **Can change** `loadNavi` function signature (with coordination)
- 🚧 **Can change** return type interface (with coordination)
- 🚧 **Can modify** CDN loading mechanism (with coordination)
- 🚧 **Can change** environment detection logic (with coordination)
- ✅ **Can update** CDN version mapping
- ✅ **Can add** new loading options
- ✅ **Can improve** error handling

---

### **React Components API Contract** (`navi-react` → Customer)

**Version:** 0.1.0  
**Status:** 🚧 In Development  
**Last Updated:** 2024-01-XX

#### **Provider API**
```typescript
interface NaviProviderProps {
  publishableKey: string;
  pathwayId: string;
  branding?: BrandingConfig;
  children: ReactNode;
}

export function NaviProvider(props: NaviProviderProps): JSX.Element;
```

#### **Hook API**
```typescript
interface NaviContextType {
  client: NaviClient | null;
  auth: AuthResult | null;
  branding: BrandingConfig;
  cssProperties: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  pathwayId: string | null;
  publishableKey: string;
}

export function useNavi(): NaviContextType;
```

#### **Component API**
```typescript
export function MockActivitiesLoader(): JSX.Element;
```

#### **Breaking Change Rules** (v0.x.x Development)
- 🚧 **Can remove** exported components/hooks (with coordination)
- 🚧 **Can change** prop interfaces (with coordination)
- 🚧 **Can change** hook return types (with coordination)
- 🚧 **Can change** component behavior (with coordination)
- ✅ **Can add** optional props
- ✅ **Can add** new hooks/components
- ✅ **Can extend** hook return types

---

## 🔄 Version Coordination Matrix

### **Breaking Change Propagation**

| **Changed Package** | **Requires Major Bump** | **Requires Minor Bump** | **Notes** |
|-------------------|----------------------|----------------------|----------|
| `navi-core` | All dependent packages | None | Foundation changes affect everyone |
| `navi-portal` (embed API) | `navi-loader`, `navi-js` | `navi-react` (if using portal) | API contract violation |
| `navi-loader` (global API) | `navi-js` | None | CDN API stability critical |
| `navi-js` | None | None | Wrapper only, shouldn't break consumers |
| `navi-react` | None | None | Independent component library |

### **Safe Change Examples**

✅ **Non-Breaking Changes:**
- Adding optional parameters to embed routes
- Adding new postMessage event types
- Adding new methods to loader instances
- Adding new React components
- Internal implementation improvements

❌ **Breaking Changes:**
- Removing required embed parameters
- Changing existing event data structure
- Removing loader API methods
- Changing React prop interfaces
- Modifying iframe behavior

## 📅 Change Log

### **v1.0.0** (Current)
- ✅ Initial API contracts established
- ✅ Embed route signature defined
- ✅ PostMessage events specified
- ✅ CDN loader API finalized
- ✅ React components baseline

### **Planned Changes**

#### **v1.1.0** (Proposed)
- 🟡 Add `onComplete` callback to embed options
- 🟡 Add `theme` parameter to embed routes
- 🟡 Add `navi.activity.started` event type
- **Impact**: Minor bumps only (backward compatible)

#### **v2.0.0** (Future)
- 🔴 Remove deprecated `size` option from loader
- 🔴 Change embed route to use POST for security
- 🔴 Update React components to use new context API
- **Impact**: Major bumps across all packages

## 🚨 Breaking Change Process

### **Before Making Breaking Changes**

1. **Update this document** with proposed changes
2. **Create migration guide** for customers
3. **Plan coordinated release** across affected packages
4. **Get stakeholder approval** for customer impact

### **Implementation Order**

1. **Update API contracts** (this document)
2. **Implement in dependency order** (core → portal → loader → js/react)
3. **Update version mappings** in navi-js
4. **Test full integration flow**
5. **Generate changesets** for all affected packages
6. **Coordinate release** following release pipeline

### **Customer Communication**

- **Advanced notice** for breaking changes (2+ weeks)
- **Migration guides** with code examples
- **Version compatibility matrix**
- **Support for previous versions** (at least 6 months)

---

## 📞 Maintenance

This document should be updated:
- ✅ **Before** implementing breaking changes
- ✅ **When** adding new API surfaces
- ✅ **After** major releases
- ✅ **During** planning sessions for new features

**Responsible**: All developers working on public APIs
**Review**: Required for all changes affecting customer integration 