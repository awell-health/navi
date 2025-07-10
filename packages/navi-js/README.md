# @awell-health/navi-js

> Navi.js loading utility - loads the Navi SDK from CDN (like @stripe/stripe-js)

## Architecture Overview

This package follows the **Stripe.js model** for security, performance, and compliance:

- ✅ **CDN-only distribution** - Must load from `https://cdn.navi.com` 
- ✅ **Version pinning** - Each npm package version pins to specific CDN version
- ✅ **Security compliance** - Cannot bundle or self-host (like Stripe for PCI compliance)
- ✅ **Global caching** - CDN provides optimal performance worldwide

## Installation

```bash
npm install @awell-health/navi-js
```

## Basic Usage

```typescript
import { loadNavi } from '@awell-health/navi-js';

const navi = await loadNavi('pk_test_your_key_here');

const instance = navi.renderActivities('#container', {
  pathwayId: 'pathway_patient_intake',
  organizationId: 'org_customer_123',
  userId: 'user_patient_456'
});
```

## Production Architecture

### **🌐 CDN Distribution (`https://cdn.navi.com`)**
```
https://cdn.navi.com/
├── v1/navi-loader.js           ← Latest v1.x.x
├── v1.0.0/navi-loader.js       ← Specific version
├── v1.1.0/navi-loader.js       ← Specific version
└── v2/navi-loader.js           ← Future v2.x.x
```

### **🔒 Embed Portal (`https://embed.navi.com`)**
```
https://embed.navi.com/
└── [pathway_id]                ← Iframe content only
```

### **📦 NPM Wrapper (`@awell-health/navi-js`)**
```
npm install @awell-health/navi-js
└── Loads: https://cdn.navi.com/v1/navi-loader.js
```

## Deployment Pipeline

### **1. navi-loader (CDN)**
```bash
# Build the IIFE bundle
cd packages/navi-loader
pnpm build
# Output: dist/navi-loader.js

# Deploy to CDN with versioning
aws s3 cp dist/navi-loader.js s3://cdn.navi.com/v1.0.0/navi-loader.js
aws s3 cp dist/navi-loader.js s3://cdn.navi.com/v1/navi-loader.js  # latest
```

### **2. navi-js (NPM)**
```bash
# Build the wrapper package
cd packages/navi-js
pnpm build
# Output: dist/index.js, dist/index.mjs, dist/index.d.ts

# Publish to NPM
npm publish
```

### **3. navi-portal (Embed)**
```bash
# Deploy embed-only portal
cd apps/navi-portal
pnpm build
# Deploy to: https://embed.navi.com
```

## Version Mapping

| **@awell-health/navi-js** | **CDN Version** | **Release Date** |
|---------------------------|-----------------|------------------|
| v1.0.x                    | v1.0.0          | 2024-01-15      |
| v1.1.x                    | v1.1.0          | 2024-02-01      |
| v1.2.x                    | v1.2.0          | 2024-03-01      |

## Security Model

### **Like Stripe's PCI Compliance**
```typescript
// ❌ FORBIDDEN - Cannot bundle or self-host
import naviBundle from './navi-loader.js';  // Not allowed!

// ✅ REQUIRED - Must load from official CDN
import { loadNavi } from '@awell-health/navi-js';
const navi = await loadNavi('pk_test_...');  // Loads from CDN
```

### **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdn.navi.com;">
```

## Development vs Production

### **Development (localhost:3000)**
```typescript
// Automatically detects development environment
const navi = await loadNavi('pk_test_demo123');
// Loads: http://localhost:3000/navi-loader.js
// Iframes: http://localhost:3000/embed/pathway_123
```

### **Production (CDN)**
```typescript
// Production automatically uses CDN
const navi = await loadNavi('pk_live_prod456');
// Loads: https://cdn.navi.com/v1/navi-loader.js
// Iframes: https://embed.navi.com/pathway_123
```

## Customer Integration Examples

### **E-commerce Checkout**
```typescript
import { loadNavi } from '@awell-health/navi-js';

// During checkout process
const navi = await loadNavi('pk_live_xyz');
const healthScreen = navi.renderActivities('#health-screening', {
  pathwayId: 'health_screening_checkout',
  organizationId: 'org_ecommerce_store',
  userId: `customer_${customerId}`,
  size: 'compact'
});

healthScreen.on('navi.pathway.completed', () => {
  // Continue with checkout
  proceedToPayment();
});
```

### **Patient Portal**
```typescript
import { loadNavi } from '@awell-health/navi-js';

// In patient dashboard
const navi = await loadNavi('pk_live_abc');
const dailyCheckin = navi.renderActivities('#daily-checkin', {
  pathwayId: 'daily_wellness_checkin',
  organizationId: 'org_hospital_123',
  userId: `patient_${patientId}`,
  size: 'standard'
});
```

### **React Integration**
```tsx
import { useEffect, useState } from 'react';
import { loadNavi } from '@awell-health/navi-js';

function NaviWidget({ pathwayId, userId }) {
  const [instance, setInstance] = useState(null);
  
  useEffect(() => {
    const init = async () => {
      const navi = await loadNavi('pk_test_demo');
      const widget = navi.renderActivities('#navi-container', {
        pathwayId,
        organizationId: 'org_react_app',
        userId
      });
      setInstance(widget);
    };
    
    init();
    
    return () => instance?.destroy();
  }, [pathwayId, userId]);
  
  return <div id="navi-container" />;
}
```

## CDN Configuration

### **Google Cloud CDN**
```yaml
# Deploy to Google Cloud Storage + CDN
resource: google-cloud-storage
bucket: cdn-navi-com
cdn: global
cache: 1 year
```

### **CloudFlare CDN**
```yaml
# Alternative: CloudFlare for global distribution
domain: cdn.navi.com
cache: aggressive
compression: gzip, brotli
```

### **AWS CloudFront**
```yaml
# Alternative: AWS CloudFront
origin: s3://cdn-navi-com
cache-policy: optimized-caching
gzip: true
```

## Monitoring & Analytics

### **CDN Metrics**
- Request count by version
- Global latency by region  
- Cache hit rates
- Error rates

### **Usage Analytics**
- Load success/failure rates
- Time to interactive
- Customer adoption by version

## Migration Guide

### **From Current Architecture**
```typescript
// OLD - Direct portal serving
<script src="http://localhost:3000/navi-loader.js"></script>

// NEW - CDN + NPM wrapper  
npm install @awell-health/navi-js
import { loadNavi } from '@awell-health/navi-js';
```

### **Versioning Strategy**
1. **Major versions** - Breaking API changes
2. **Minor versions** - New features, backwards compatible
3. **Patch versions** - Bug fixes only

## Support

- 📖 [Documentation](https://docs.navi.awell.com)
- 🚀 [Migration Guide](https://docs.navi.awell.com/migration)
- 💬 [Support](https://support.awell.com)

---

## Implementation Status

- [ ] **CDN Infrastructure** - Set up Google Cloud CDN or CloudFlare
- [ ] **Deployment Pipeline** - Automate version deployment to CDN
- [ ] **Version Management** - Pin npm package versions to CDN versions
- [ ] **Environment Detection** - Auto-switch between localhost and CDN
- [ ] **Portal Separation** - Split embed routes from main portal
- [ ] **DNS Configuration** - Set up `cdn.navi.com` and `embed.navi.com` 