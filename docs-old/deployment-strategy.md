# Navi SDK Deployment Strategy

## Stripe-like CDN + NPM Architecture

## Overview

Following the Stripe.js model for maximum security, performance, and compliance:

### **Current POC (Development)**

```
🏢 localhost:3000 (navi-portal)
├── /navi-loader.js          ← Direct serving (not scalable)
└── /embed/[pathway_id]      ← Embed content
```

### **Production Architecture (Proposed)**

```
🌐 https://cdn.awellhealth.com      ← Google Cloud CDN
├── /v1/navi-loader.js       ← Latest v1.x.x
├── /v1.0.0/navi-loader.js   ← Pinned versions
└── /v1.1.0/navi-loader.js   ← Pinned versions

🔒 https://navi-portal.awellhealth.com    ← Embed-only portal
└── /[pathway_id]            ← Iframe content

📦 @awell-health/navi-js     ← NPM wrapper package
└── Loads CDN script like Stripe
```

## Phase 1: CDN Infrastructure Setup

### **Option A: Google Cloud CDN (Recommended)**

```yaml
# Google Cloud Storage + CDN
bucket: cdn-navi-com
location: multi-region (US/EU/ASIA)
cdn: global
cache_control: public, max-age=31536000 # 1 year
compression: gzip, brotli
```

**Setup Steps:**

```bash
# 1. Create bucket
gsutil mb -p navi-prod gs://cdn-navi-com

# 2. Enable public access
gsutil iam ch allUsers:objectViewer gs://cdn-navi-com

# 3. Set up CDN
gcloud compute backend-buckets create cdn-navi-backend \
  --gcs-bucket-name=cdn-navi-com

# 4. Configure DNS
# Point cdn.awellhealth.com → Cloud CDN IP
```

### **Option B: CloudFlare (Alternative)**

```yaml
# CloudFlare Pro/Business plan
domain: cdn.awellhealth.com
cache: aggressive
compression: brotli
security: high
geo_distribution: global
```

## Phase 2: Build & Deployment Pipeline

### **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy-cdn.yml
name: Deploy to CDN

on:
  push:
    tags: ["v*"]

jobs:
  deploy-cdn:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build navi-loader
        run: |
          cd packages/navi-loader
          pnpm install
          pnpm build

      - name: Extract version
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: Deploy to CDN
        run: |
          # Deploy versioned file
          gsutil cp packages/navi-loader/dist/navi-loader.js \
            gs://cdn-navi-com/${{ steps.version.outputs.version }}/navi-loader.js
            
          # Update latest if major version
          if [[ "${{ steps.version.outputs.version }}" =~ ^v1\. ]]; then
            gsutil cp packages/navi-loader/dist/navi-loader.js \
              gs://cdn-navi-com/v1/navi-loader.js
          fi

      - name: Publish NPM package
        run: |
          cd packages/navi-js
          # Update version to pin to CDN version
          npm version ${{ steps.version.outputs.version }}
          npm publish
```

### **Version Management Strategy**

```typescript
// packages/navi-js/src/shared.ts
const CDN_VERSION_MAP = {
  "1.0.0": "v1.0.0",
  "1.1.0": "v1.1.0",
  "1.2.0": "v1.2.0",
};

const getSDKVersion = () => {
  const packageVersion = _VERSION; // e.g., "1.1.0"
  return CDN_VERSION_MAP[packageVersion] || "v1";
};

const NAVI_JS_URL = `https://cdn.awellhealth.com/${getSDKVersion()}/navi-loader.js`;
```

## Phase 3: Domain & DNS Setup

### **DNS Configuration**

```
# CDN Domain
cdn.awellhealth.com    CNAME   cdn-navi-com.googlecdn.com

# Embed Domain (separate app/deployment)
navi-portal.awellhealth.com  CNAME   navi-embed-prod.vercel.app
```

### **SSL/TLS Configuration**

```yaml
# Google Cloud Load Balancer SSL
managed_ssl: true
domains:
  - cdn.awellhealth.com

# Vercel SSL (automatic)
domains:
  - navi-portal.awellhealth.com
```

## Phase 4: Portal Separation

### **Split Embed Routes**

```bash
# Create dedicated embed app
mkdir apps/navi-embed

# Move embed routes
mv apps/navi-portal/src/app/embed/* apps/navi-embed/src/app/

# Update navi-portal to remove embed routes
# Keep only: /api/*, /careflows/*, main portal features
```

### **Environment Configuration**

```typescript
// apps/navi-embed/env.ts
export const EMBED_CONFIG = {
  development: {
    origin: "http://localhost:3000",
    allowedOrigins: ["http://localhost:3001"],
  },
  production: {
    origin: "https://navi-portal.awellhealth.com",
    allowedOrigins: ["*"], // Customer domains
  },
};
```

## Phase 5: Customer Migration

### **Migration Script**

```typescript
// migration-helper.ts
export function migrateToNewSDK() {
  console.log(`
🚀 Migrating to Stripe-like Navi SDK

OLD APPROACH:
<script src="https://portal.navi.com/navi-loader.js"></script>
<script>
  const navi = Navi('pk_test_...');
  navi.renderActivities('#container', {...});
</script>

NEW APPROACH:
npm install @awell-health/navi-js

import { loadNavi } from '@awell-health/navi-js';
const navi = await loadNavi('pk_test_...');
navi.renderActivities('#container', {...});

BENEFITS:
✅ TypeScript support
✅ Global CDN performance  
✅ Automatic version management
✅ Better security compliance
  `);
}
```

### **Backward Compatibility**

```typescript
// Keep old route during transition period
// apps/navi-portal/src/app/navi-loader.js/route.ts
export async function GET() {
  return new NextResponse(
    `
// DEPRECATED: Please migrate to @awell-health/navi-js
// See: https://docs.navi.awell.com/migration

console.warn('⚠️  DEPRECATED: Direct script loading will be removed in v2.0.0');
console.warn('📦 Please install @awell-health/navi-js for the new SDK');

// Redirect to CDN
window.location.href = 'https://cdn.awellhealth.com/v1/navi-loader.js';
  `,
    {
      headers: { "Content-Type": "application/javascript" },
    }
  );
}
```

## Performance & Monitoring

### **CDN Metrics to Track**

- **Request volume** by version
- **Global latency** by region
- **Cache hit rates** (should be >95%)
- **Error rates** (should be <0.1%)
- **Bandwidth usage**

### **Customer Analytics**

- **Load success/failure rates**
- **Time to interactive**
- **Version adoption rates**
- **Geographic usage patterns**

### **Alerting**

```yaml
# CloudWatch/Google Cloud Monitoring
alerts:
  - name: CDN Error Rate High
    condition: error_rate > 1%
    action: notify_team

  - name: CDN Latency High
    condition: p95_latency > 500ms
    action: investigate

  - name: Version Adoption Low
    condition: new_version_adoption < 50% after 30 days
    action: communication_plan
```

## Security Considerations

### **Content Security Policy**

```html
<!-- Customer websites should include -->
<meta
  http-equiv="Content-Security-Policy"
  content="script-src 'self' https://cdn.awellhealth.com; 
               frame-src https://navi-portal.awellhealth.com;"
/>
```

### **CDN Security**

```yaml
# Google Cloud CDN Security
cloud_armor: enabled
ddos_protection: adaptive
rate_limiting: enabled
ssl_policy: modern # TLS 1.2+ only
```

### **Like Stripe's Compliance Model**

- ✅ **Cannot bundle** - Must load from official CDN
- ✅ **Cannot self-host** - Security/compliance violation
- ✅ **Version pinning** - Predictable behavior
- ✅ **Global caching** - Performance & reliability

## Cost Estimation

### **Google Cloud CDN**

```
Requests: 10M/month @ $0.075/1M = $0.75
Bandwidth: 100GB/month @ $0.08/GB = $8.00
Storage: 1GB @ $0.020/GB = $0.02
Total: ~$9/month for 10M requests
```

### **CloudFlare Business**

```
Plan: $200/month
Bandwidth: Unlimited
Requests: Unlimited
Global CDN: Included
```

## Next Steps

1. **Choose CDN provider** (Google Cloud vs CloudFlare)
2. **Set up DNS** (`cdn.awellhealth.com`, `navi-portal.awellhealth.com`)
3. **Create deployment pipeline** (GitHub Actions)
4. **Test with pilot customers** before full migration
5. **Documentation & migration guides**

This gives you a true **Stripe-like architecture** with global CDN distribution, proper versioning, and enterprise-grade reliability! 🚀
