# Package Development Guidelines

**🚧 DEVELOPMENT PHASE (v0.x.x)**: Breaking changes are acceptable but require coordination. Guidelines focus on architecture quality while maintaining flexibility for rapid iteration.

This document defines the development rules, API stability requirements, and quality standards for each package in the Navi monorepo.

## 📦 Package Overview & Responsibilities

```
navi-core (Foundation) ← Independent utilities & types
    ↓
navi-portal (Embed App) ← Defines embed API contract
    ↓
navi-loader (CDN SDK) ← Global JavaScript API
    ↓
navi-js (NPM Wrapper) ← Loads CDN + TypeScript types
    ↓
navi-react (Components) ← Direct React integration
```

---

## 🏗️ navi-core (Foundation Package)

**Location**: `packages/navi-core/`  
**Purpose**: Shared utilities, types, and services  
**Bundle Target**: 25KB gzipped max  
**Dependencies**: Minimal - only essential utilities

### **Key Responsibilities**

- TypeScript type definitions
- Authentication utilities (JWT, token validation)
- GraphQL client configuration
- Shared interfaces and enums
- Validation functions
- Error handling utilities

### **Development Guidelines**

#### **Code Structure**

```typescript
// ✅ Good - Pure utilities
export function validatePublishableKey(key: string): boolean {
  return key.startsWith("pk_test_") || key.startsWith("pk_live_");
}

// ✅ Good - Use shared types from navi-core
import type { BrandingConfig } from "@awell-health/navi-core";

// BrandingConfig is defined in navi-core/src/types/config.ts
// and shared across all packages to avoid duplication

// ❌ Bad - No side effects or globals
window.naviCore = {}; // Don't do this
```

#### **Testing Requirements**

- **Unit tests**: Every exported function
- **Type tests**: Interface compatibility
- **Edge cases**: Validation functions
- **No integration tests**: Pure utilities only

#### **API Stability Rules**

- **NEVER remove** exported functions/types
- **NEVER change** existing interfaces (breaking)
- **ALWAYS** maintain backward compatibility
- **CAN add** new optional properties
- **CAN add** new utility functions

#### **Performance Considerations**

- **Tree-shakeable exports**: Each function separately exportable
- **No large dependencies**: Keep bundle minimal
- **Lazy loading**: Heavy utilities should be optional imports

---

## 🏢 navi-portal (Embed Application)

**Location**: `apps/navi-portal/`  
**Purpose**: Vercel-deployed app serving iframe content  
**Bundle Target**: FCP < 1000ms, TTI < 2500ms  
**Runtime**: Edge or Node.js (use Runtime Decision Matrix)

### **Key Responsibilities**

- Embed route (`/embed/[pathway_id]`)
- JWT token creation and validation
- Activity rendering inside iframes
- Cross-origin postMessage communication
- Branding and theming system
- HIPAA-compliant logging

### **Development Guidelines**

#### **Embed Route Contract**

```typescript
// ✅ Required route signature - CANNOT change without major version
GET /embed/[pathway_id]?pk={key}&instance_id={id}&org_id={org}&user_id={user}&session_id={session}&stakeholder_id={stakeholder}&branding={json}

// ✅ PostMessage events - CANNOT remove existing events
interface NaviEmbedMessage {
  source: 'navi';
  instance_id: string;
  type: 'navi.ready' | 'navi.activity.completed' | 'navi.pathway.completed' | 'navi.height.changed' | 'navi.error';
  [key: string]: any;
}
```

#### **Security Requirements**

- **JWT validation**: Proper signature verification
- **Origin validation**: Secure cross-origin messaging
- **HIPAA compliance**: Structured logging, no PII in logs
- **CSP headers**: Prevent XSS attacks
- **Input sanitization**: All query parameters

#### **Performance Requirements**

- **First Contentful Paint**: < 1000ms on 4G mobile
- **Time to Interactive**: < 2500ms
- **Bundle optimization**: Code splitting, dynamic imports
- **Edge runtime preferred**: For global distribution

#### **Testing Requirements**

- **Cross-origin tests**: Verify postMessage communication
- **JWT validation tests**: Token creation and verification
- **Performance tests**: Lighthouse CI integration
- **Accessibility tests**: WCAG 2.1 AA compliance
- **Error boundary tests**: Graceful failure handling

#### **Branding System**

```typescript
// ✅ Branding implementation pattern
const branding = await getBrandingByOrgId(orgId);
const themeCSS = generateThemeCSS(branding);

// Apply CSS custom properties
document.documentElement.style.setProperty("--primary-color", branding.primary);
```

---

## 🌐 navi-loader (CDN JavaScript SDK)

**Location**: `packages/navi-loader/`  
**Purpose**: Customer-facing JavaScript SDK  
**Bundle Target**: 15KB gzipped max  
**Distribution**: CDN only (cannot be bundled)

### **Key Responsibilities**

- Global `window.Navi` API
- Iframe creation and management
- Cross-origin postMessage handling
- Customer event system
- Environment detection (dev vs prod)
- Error handling and reporting

### **Development Guidelines**

#### **Global API Stability**

```typescript
// ✅ NEVER change this signature - customer-facing API
declare global {
  interface Window {
    Navi: (publishableKey: string) => NaviInstance;
  }
}

// ✅ NEVER remove methods - breaking change
interface NaviInstance {
  renderActivities: (
    containerId: string,
    options: RenderOptions
  ) => NaviEmbedInstance;
}

// ✅ Can add optional properties to options
interface RenderOptions {
  pathwayId: string;
  stakeholderId?: string;
  organizationId?: string;
  // ✅ New optional properties OK
  newFeature?: boolean;
}
```

#### **Cross-Origin Security**

```typescript
// ✅ Strict origin validation
const handleMessage = (event: MessageEvent) => {
  // Development vs production origins
  const allowedOrigins =
    process.env.NODE_ENV === "development"
      ? ["http://localhost:3000"]
      : ["https://embed.navi.com"];

  if (!allowedOrigins.includes(event.origin)) {
    return; // Ignore unauthorized messages
  }
};
```

#### **Bundle Size Optimization**

- **No external dependencies**: Inline everything needed
- **Tree shaking**: Remove unused code paths
- **Minification**: UglifyJS/Terser aggressive settings
- **Compression**: Gzip/Brotli optimization
- **Bundle analysis**: Regular size monitoring

#### **Error Handling**

```typescript
// ✅ Customer-friendly error handling
try {
  const instance = navi.renderActivities("#container", options);
} catch (error) {
  // ✅ Actionable error messages
  throw new Error(
    `Navi SDK: Container '#container' not found. Please ensure the element exists before calling renderActivities.`
  );
}
```

#### **Testing Requirements**

- **Cross-origin tests**: iframe ↔ parent communication
- **Bundle size tests**: Automated size limit checking
- **Integration tests**: Full customer flow simulation
- **Error scenario tests**: Network failures, invalid options
- **Browser compatibility**: IE11+, modern browsers

---

## 📥 navi-js (NPM Wrapper Package)

**Location**: `packages/navi-js/`  
**Purpose**: NPM package that loads CDN script  
**Bundle Target**: 2KB gzipped max  
**Distribution**: NPM only

### **Key Responsibilities**

- CDN script loading (like `@stripe/stripe-js`)
- Environment detection (localhost vs CDN)
- TypeScript type definitions
- Version mapping to CDN versions
- Security model enforcement

### **Development Guidelines**

#### **CDN Loading Pattern**

```typescript
// ✅ Stripe-like loading pattern
export const loadNavi: LoadNavi = async (publishableKey: string) => {
  // ✅ Cannot bundle - must load from CDN
  const script = await loadScript(); // Loads from CDN
  if (!script) return null;

  return script(publishableKey);
};

// ❌ NEVER allow bundling
// import naviBundle from './navi-loader.js'; // Forbidden!
```

#### **Version Mapping Management**

```typescript
// ✅ Map NPM version to CDN version
const CDN_VERSION_MAP = {
  "1.0.0": "v1.0.0",
  "1.1.0": "v1.1.0",
  "1.2.0": "v1.2.0",
};

// ✅ Environment-aware URLs
const getCDNUrl = () => {
  const version = CDN_VERSION_MAP[_VERSION] || "v1";
  return process.env.NODE_ENV === "development"
    ? `http://localhost:3000/navi-loader.js`
    : `https://cdn.navi.com/${version}/navi-loader.js`;
};
```

#### **TypeScript Integration**

- **Full type coverage**: Complete API definitions
- **Ambient declarations**: Global `window.Navi` types
- **Generic safety**: Proper inference
- **Export organization**: Clean public API

#### **Testing Requirements**

- **CDN loading tests**: Script injection and loading
- **Environment tests**: localhost vs production URLs
- **Type tests**: TypeScript compilation
- **SSR safety**: Server-side rendering compatibility

---

## ⚛️ navi-react (React Components)

**Location**: `packages/navi-react/`  
**Purpose**: Direct React component integration  
**Bundle Target**: 40KB per component max  
**Distribution**: NPM package

### **Key Responsibilities**

- React context provider
- Activity rendering components
- Custom hooks for Navi integration
- State management
- Component lifecycle handling

### **Development Guidelines**

#### **Component Architecture**

```tsx
// ✅ Provider pattern
export function NaviProvider({
  publishableKey,
  pathwayId,
  branding,
  children,
}: NaviProviderProps) {
  // ✅ Stable state management
  const [naviState, setNaviState] = useState<NaviContextType>(initialState);

  // ✅ Memoized context value
  const contextValue = useMemo(
    () => ({
      ...naviState,
      publishableKey,
      pathwayId,
    }),
    [naviState, publishableKey, pathwayId]
  );

  return (
    <NaviContext.Provider value={contextValue}>{children}</NaviContext.Provider>
  );
}
```

#### **Hooks Rules Compliance**

```tsx
// ✅ Proper hooks usage
export function MockActivitiesLoader() {
  const { publishableKey, pathwayId, branding, isLoading, error } = useNavi();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [events, setEvents] = useState<Event[]>([]);

  // ✅ All hooks at top level before conditionals
  const embedUrl = useMemo(() => {
    if (!pathwayId || !publishableKey) return "";
    return buildEmbedUrl(pathwayId, publishableKey, branding);
  }, [pathwayId, publishableKey, branding]);

  // ✅ Then conditional returns
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <iframe ref={iframeRef} src={embedUrl} />;
}
```

#### **Performance Optimization**

```tsx
// ✅ Memoization for expensive operations
const processedData = useMemo(() => heavyDataProcessing(rawData), [rawData]);

// ✅ Stable callback references
const handleMessage = useCallback(
  (event: MessageEvent) => {
    // Handle iframe messages
  },
  [instanceId]
);

// ✅ Avoid recreating objects in render
const style = useMemo(
  () => ({
    fontFamily: branding?.fontFamily || "Inter, sans-serif",
  }),
  [branding?.fontFamily]
);
```

#### **Accessibility Requirements**

- **WCAG 2.1 AA**: All components compliant
- **Keyboard navigation**: Full keyboard accessibility
- **Screen readers**: Proper ARIA labels
- **Focus management**: Logical tab order
- **Color contrast**: Minimum 4.5:1 ratio

#### **Testing Requirements**

- **Component tests**: React Testing Library
- **Hook tests**: Custom hook behavior
- **Integration tests**: Provider + consumer patterns
- **Accessibility tests**: Automated a11y testing
- **Performance tests**: Render time, memory usage

---

## 🔧 Cross-Package Coordination

### **Dependency Updates**

```bash
# ✅ Update dependencies in order
1. Update navi-core types
2. Update navi-portal to use new types
3. Update navi-loader if embed API changed
4. Update navi-js if loader API changed
5. Update navi-react if core types changed
```

### **Breaking Change Coordination**

```typescript
// ✅ When changing core types
// 1. Update API-CONTRACTS.md FIRST
// 2. Implement in navi-core
// 3. Update dependent packages
// 4. Generate coordinated changesets
// 5. Test full integration flow
```

### **Testing Integration**

```bash
# ✅ Always test the full flow
pnpm dev  # localhost:3000 + localhost:3001
# Test iframe integration: 3001 → 3000/embed
# Test React integration: 3001/react-demo
# Verify cross-origin messaging works
```

---

## 📋 Quality Gates

### **Pre-Merge Checklist**

- [ ] All package tests pass
- [ ] Cross-package integration tested
- [ ] Bundle sizes within limits
- [ ] API contracts updated if needed
- [ ] Performance budgets met
- [ ] Accessibility standards maintained

### **Release Readiness**

- [ ] Changesets generated for affected packages
- [ ] Version coordination planned
- [ ] CDN deployment strategy ready
- [ ] Customer migration path documented
- [ ] Rollback procedures tested

This ensures every package maintains high quality while working together as a cohesive SDK system! 🚀
