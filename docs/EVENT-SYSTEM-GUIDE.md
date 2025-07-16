# Event System Architecture Guide

**🎯 Purpose**: Quick reference for AI agents working with activity events and postMessage communication.

## 🏗️ **Event Flow Overview**
```
React Components → useActivityEvents → postMessage → navi.js → Customer
     (portal)         (hook)           (cross-origin)   (SDK)    (callbacks)
```

## 📋 **Three-Layer System**

### **Layer 1: navi-core (Source of Truth)**
**File**: `packages/navi-core/src/types/activity-event.ts`
```typescript
// Internal event format (dash-separated)
"activity-ready"        // Component mounted
"activity-activate"     // Activity became active  
"activity-progress"     // Progress tracking
"activity-data-change"  // Real-time data updates
"activity-complete"     // Activity finished
"activity-error"        // Error occurred
"activity-focus"        // Activity focused
"activity-blur"         // Activity blurred
```

### **Layer 2: navi-portal (Event Emission)**
**File**: `apps/navi-portal/src/hooks/use-activity-events.tsx`
```typescript
// React hook converts to postMessage
emitActivityEvent("activity-ready");
  ↓
window.parent.postMessage({
  source: "navi",
  type: "navi.activity.ready",
  instance_id: "navi-abc123"
}, "*");
```

### **Layer 3: navi.js (Customer API)**
**File**: `packages/navi.js/src/index.ts` (lines 159-279)
```typescript
// Customer-facing events (dot notation)
instance.on("navi.activity.ready", callback);
instance.on("navi.activity.dataChange", callback);  // ← camelCase conversion
```

## 🔄 **Event Name Transformations**
| navi-core | postMessage | Customer API |
|-----------|-------------|--------------|
| `activity-ready` | `navi.activity.ready` | `navi.activity.ready` |
| `activity-data-change` | `navi.activity.data-change` | `navi.activity.dataChange` |
| `activity-complete` | `navi.activity.completed` | `navi.activity.completed` |

## 📊 **Event Data Structures**

### **Basic Event**
```typescript
interface ActivityEvent {
  type: string;
  activityId: string;
  activityType: "FORM" | "MESSAGE" | "CHECKLIST";
  data?: any;
  timestamp: number;
}
```

### **Common Event Data**
```typescript
// Progress events
{ progress: 3, total: 5 }

// Data change events  
{ field: "patient_name", value: "John", currentData: {...} }

// Completion events
{ submissionData: { patient_name: "John", age: 30 } }

// Error events
{ error: "Validation failed", field: "patient_name" }
```

## 🛠️ **Implementation Examples**

### **Portal: Emit Event**
```typescript
const { emitActivityEvent } = useActivityEvents(activityId, "FORM");
emitActivityEvent("activity-progress", { progress: 2, total: 5 });
```

### **navi.js: Handle Event**
```typescript
case "navi.activity.data-change":
  this.handleActivityEvent(instance, "dataChange", data);  // ← camelCase
```

### **Customer: Listen to Event**
```typescript
instance.on("navi.activity.dataChange", (event) => {
  console.log("Field changed:", event.data.field, event.data.value);
});
```

## 🧪 **Testing Event System**
```bash
# Start both servers
cd apps/navi-portal && pnpm dev      # localhost:3000
cd examples/test-integration && pnpm dev  # localhost:3001

# Test cross-origin communication
# Visit: http://localhost:3001
```

## 🚨 **Common Issues**

### **Event Name Mismatches**
```typescript
// ❌ WRONG
instance.on("activity-ready", callback);  // Internal format

// ✅ CORRECT  
instance.on("navi.activity.ready", callback);  // Customer format
```

### **Memory Leaks**
```typescript
// ❌ WRONG
destroyInstance(instanceId: string) {
  this.instances.delete(instanceId);
  // Missing event handler cleanup
}

// ✅ CORRECT
destroyInstance(instanceId: string) {
  this.instances.delete(instanceId);
  this.eventHandlers.delete(instanceId);  // ← Clean up
}
```

## 📚 **Files to Modify**

### **Adding New Event Type**
1. **navi-core**: Add to `activity-event.ts`
2. **navi-portal**: Add to `use-activity-events.tsx`
3. **navi.js**: Add to `handleMessage()` switch

### **Changing Event Data**
1. **navi-core**: Update `ActivityEvent` interface
2. **navi-portal**: Update event emission
3. **navi.js**: Update customer data transformation

## 🎯 **Agent Guidelines**
- **Understand the flow** - Read all 3 layers
- **Test cross-origin** - Always verify iframe communication
- **Check naming** - Ensure consistency across layers
- **Clean up properly** - Prevent memory leaks

---

**💡 Tip**: Events are the primary customer interface. Test thoroughly and coordinate changes across all layers.