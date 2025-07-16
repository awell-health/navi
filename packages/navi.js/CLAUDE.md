# Navi.js Package - AI Agent Guidelines

## 📋 **READ FIRST**

1. **[../../CLAUDE.md](../../CLAUDE.md)** - Repository rules
2. **[../../docs/API-CONTRACTS.md](../../docs/API-CONTRACTS.md)** - Interface contracts
3. **This document** - navi.js specifics

## 🎯 **Package Overview**

**navi.js** = Customer-facing CDN JavaScript SDK (15KB max)

- **Global API**: `window.Navi(publishableKey)`
- **Iframe Management**: Creates, manages activity iframes
- **Event System**: Handles cross-origin postMessage
- **Single file**: `src/index.ts` (375 lines)

## 🚧 **v0.x.x Development Phase**

- ✅ **Breaking changes OK** - We're building the foundation
- ✅ **API can evolve** - Focus on best developer experience
- ✅ **Experiment freely** - Don't get stuck on backward compatibility
- ⚠️ **Coordinate changes** - Update dependent packages together

## 🔄 **Event System (Critical)**

### **Event Flow**

```
Portal Components → postMessage → navi.js → Customer Callbacks
```

### **Event Types (8 total)**

```typescript
"navi.activity.ready"; // Component mounted
"navi.activity.activate"; // Activity became active
"navi.activity.progress"; // Progress tracking
"navi.activity.dataChange"; // Real-time data (note: camelCase)
"navi.activity.completed"; // Activity finished
"navi.activity.error"; // Error occurred
"navi.activity.focus"; // Activity focused
"navi.activity.blur"; // Activity blurred
```

### **⚠️ Name Conversion**

```typescript
// Portal sends: "navi.activity.data-change"
// Customer gets: "navi.activity.dataChange"
```

## 📚 **Agent Task Guidelines**

### **🎯 Working with Events**

**READ THESE FILES:**

1. `../../packages/navi-core/src/types/activity-event.ts` - Event type definitions
2. `../../apps/navi-portal/src/hooks/use-activity-events.tsx` - Portal event emission
3. `./src/index.ts` (lines 159-279) - Event handling implementation

### **🔐 Working with Authentication**

**READ THESE FILES:**

1. `../../apps/navi-portal/src/lib/auth/external/jwt.ts` - JWT utilities
2. `../../apps/navi-portal/src/lib/auth/external/types.ts` - Auth types
3. `./src/index.ts` (lines 99-136) - Auth parameter passing

### **🚀 Working with Deployment**

**READ THESE FILES:**

1. `../../docs/RELEASE-PIPELINE.md` - Release coordination
2. `./tsup.config.ts` - Build configuration
3. `./src/index.ts` - Environment detection

## 🚨 **Critical Implementation Details**

### **Security (Non-negotiable)**

```typescript
// Origin validation
if (event.origin !== "http://localhost:3000") return; // dev
if (event.origin !== "https://navi-portal.awellhealth.com") return; // prod

// Source validation
if (source !== "navi") return;
```

### **Performance Budget**

- Bundle size: 15KB gzipped max
- No external dependencies
- Aggressive minification

### **Memory Management**

```typescript
// Always clean up
destroyInstance(instanceId: string) {
  this.instances.delete(instanceId);
  this.eventHandlers.delete(instanceId);  // ← Don't forget this
}
```

## 🔧 **Development Workflow**

1. **Make changes** - API evolution is OK
2. **Test locally** - `pnpm build && pnpm dev`
3. **Test integration** - Run `examples/test-integration`
4. **Verify cross-origin** - localhost:3001 → localhost:3000

## 📞 **When to Ask**

**ASK BEFORE:**

- Completely rewriting global API
- Removing security features
- Breaking bundle size budget (>20KB)
- Major architectural changes

**FEEL FREE TO:**

- Modify API signatures
- Add/remove/rename events
- Improve error handling
- Optimize performance

## 🎯 **Success Criteria**

- [ ] Event system working (all 8 types)
- [ ] Cross-origin messaging functional
- [ ] Bundle under 15KB
- [ ] Security validation working
- [ ] Clean developer experience

---

**Remember**: Customer-facing SDK for healthcare apps. Quality matters. 🏥
