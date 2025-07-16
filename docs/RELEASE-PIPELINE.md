# Release Pipeline & Coordination

**🚧 DEVELOPMENT PHASE (v0.x.x)**: We're building toward v1.0.0. Breaking changes are acceptable but require coordination. Release automation will be refined as we approach production readiness.

This document defines the coordinated release strategy for the Navi monorepo packages, ensuring synchronized deployments and version compatibility.

## 🎯 Release Goals

- **API Stability**: Never break existing customer integrations
- **Version Coordination**: Ensure package compatibility across releases
- **CDN Synchronization**: Coordinate NPM versions with CDN deployments
- **Zero Downtime**: Customers can upgrade at their own pace
- **Rollback Safety**: Quick rollback capability for critical issues

## 🏗️ Release Architecture

```
Trigger: Git Tag (v1.2.0)
    ↓
GitHub Actions Workflow
    ↓
┌─────────────────────┬─────────────────────┬─────────────────────┐
│   Build Packages    │   Deploy to CDN     │   Publish to NPM    │
│                     │                     │                     │
│ 1. navi-core        │ 1. navi-loader.js   │ 1. @awell/navi-js   │
│ 2. navi-portal      │    → CDN Storage    │ 2. @awell/navi-react│
│ 3. navi-loader      │ 2. Update mappings  │ 3. @awell/navi-core │
│ 4. navi-js          │ 3. Invalidate cache │ 4. Version pinning  │
│ 5. navi-react       │                     │                     │
└─────────────────────┴─────────────────────┴─────────────────────┘
    ↓
Verification & Smoke Tests
    ↓
Customer Communication
```

## 📋 Pre-Release Checklist

### **Planning Phase**

- [ ] **API contracts reviewed** - Check `API-CONTRACTS.md` for breaking changes
- [ ] **Dependency impact assessed** - What packages need updates?
- [ ] **Performance budgets verified** - Bundle sizes within limits
- [ ] **Cross-origin testing completed** - Full integration flow tested
- [ ] **Changeset strategy planned** - Major/minor/patch for each package
- [ ] **CDN deployment strategy** - Version mapping plan
- [ ] **Customer migration path** - Documentation for breaking changes

### **Implementation Phase**

- [ ] **All tests passing** - `pnpm test` across all packages
- [ ] **Build successful** - `pnpm build` without errors
- [ ] **Bundle size check** - Within performance budgets
- [ ] **Integration testing** - localhost:3000 ↔ localhost:3001 flow
- [ ] **Changesets generated** - For all affected packages
- [ ] **Documentation updated** - README, API docs, migration guides

### **Release Phase**

- [ ] **Git tag created** - Semantic version (v1.2.0)
- [ ] **GitHub Actions triggered** - Release workflow started
- [ ] **CDN deployment verified** - New version accessible
- [ ] **NPM packages published** - All packages released
- [ ] **Smoke tests passed** - Basic integration working
- [ ] **Version mapping updated** - navi-js points to correct CDN version

## 🔄 Release Types & Strategies

### **Patch Release (1.0.X)**

**Example**: Bug fixes, internal improvements, security patches

**Process**:

1. Create changesets: `pnpm changeset` (patch level)
2. Version packages: `pnpm changeset:version`
3. Create git tag: `git tag v1.0.1`
4. Push tag: `git push origin v1.0.1`
5. GitHub Actions handles rest

**Packages Affected**: Only changed packages
**CDN Impact**: Minimal - may update latest pointers
**Customer Impact**: Safe auto-update

### **Minor Release (1.X.0)**

**Example**: New features, optional parameters, new components

**Process**:

1. **Plan coordination** - Which packages need updates?
2. **Update API contracts** - Add new features to contracts
3. **Generate changesets** - Minor bumps for affected packages
4. **Test integration flow** - Ensure backward compatibility
5. **Release coordination** - Follow dependency order
6. **Update CDN mappings** - Add new version mapping

**Packages Affected**: Feature package + dependents
**CDN Impact**: New version deployed, old versions remain
**Customer Impact**: Opt-in upgrade

### **Major Release (X.0.0)**

**Example**: Breaking API changes, removed features, new architecture

**Process**:

1. **⚠️ STOP: Breaking change process** - Follow `API-CONTRACTS.md`
2. **Customer communication** - 2+ weeks advance notice
3. **Migration guide creation** - Step-by-step upgrade instructions
4. **Coordinated changeset** - Major bumps across affected packages
5. **Staged deployment** - CDN first, then NPM
6. **Extended testing** - Multiple integration scenarios
7. **Version mapping** - Update CDN version map in navi-js

**Packages Affected**: Multiple packages (cascading major bumps)
**CDN Impact**: New major version deployed
**Customer Impact**: Manual migration required

## 🤖 GitHub Actions Workflow

### **Workflow Trigger**

```yaml
on:
  push:
    tags: ["v*"]
```

### **Job Sequence**

```yaml
jobs:
  # 1. Build all packages
  build:
    - Install dependencies
    - Build packages in dependency order
    - Run tests and linting
    - Check bundle sizes

  # 2. Deploy CDN (if navi-loader changed)
  deploy-cdn:
    needs: build
    if: contains(github.event.head_commit.modified, 'packages/navi-loader')
    - Build navi-loader bundle
    - Deploy to CDN storage
    - Update version pointers
    - Invalidate CDN cache

  # 3. Publish NPM packages
  publish-npm:
    needs: [build, deploy-cdn]
    - Update version mappings (navi-js)
    - Publish to NPM registry
    - Update git tags

  # 4. Verification
  smoke-test:
    needs: publish-npm
    - Test CDN availability
    - Test NPM package installation
    - Test basic integration flow
```

### **CDN Deployment Details**

#### **Storage Structure**

```
cdn.awellhealth.com/
├── v1/navi-loader.js           ← Latest v1.x.x
├── v1.0.0/navi-loader.js       ← Specific version
├── v1.1.0/navi-loader.js       ← Specific version
├── v1.2.0/navi-loader.js       ← New version
└── v2/navi-loader.js           ← Future major version
```

#### **Deployment Script**

```bash
# Extract version from git tag
VERSION=${GITHUB_REF#refs/tags/v}

# Deploy versioned file
gsutil cp packages/navi-loader/dist/navi-loader.js \
  gs://cdn-navi-com/v${VERSION}/navi-loader.js

# Update latest pointer for minor/patch
if [[ "$VERSION" =~ ^1\. ]]; then
  gsutil cp packages/navi-loader/dist/navi-loader.js \
    gs://cdn-navi-com/v1/navi-loader.js
fi

# Set cache headers (1 year for versioned, 1 hour for latest)
gsutil setmeta -h "Cache-Control:public,max-age=31536000" \
  gs://cdn-navi-com/v${VERSION}/navi-loader.js
```

## 📦 Package Versioning Strategy

### **Semantic Versioning (v0.x.x Development)**

**Development Phase Approach:**

- **0.1.x** - Foundational features and architecture
- **0.2.x** - Core functionality complete
- **0.x.x** - Feature additions and refinements
- **1.0.0** - Production-ready stable release

**Breaking Changes in v0.x.x:**

- Minor version bumps for breaking changes (0.1.0 → 0.2.0)
- Major version stays at 0 until production ready
- Coordinate across packages for compatibility
- Document all breaking changes in changesets

## 📦 Package Release Order

### **Dependency-Ordered Release**

```
1. navi-core        (foundation)
    ↓
2. navi-portal      (if embed API changed)
    ↓
3. navi-loader      (build + CDN deploy)
    ↓
4. navi-js          (update CDN mapping)
    ↓
5. navi-react       (if changed)
```

### **Changeset Coordination**

```bash
# Example coordinated changeset for minor release
.changeset/feature-new-events.md:
---
"@awell-health/navi-core": minor
"@awell-health/navi-loader": minor
"@awell-health/navi-js": minor
---

Add new activity events for better customer insights
- Added navi.activity.started event
- Added progress tracking to navi.activity.progress
- Updated TypeScript definitions
```

## 🔍 Version Mapping Management

### **CDN Version Map** (in navi-js)

```typescript
// packages/navi-js/src/shared.ts
const CDN_VERSION_MAP = {
  "1.0.0": "v1.0.0",
  "1.1.0": "v1.1.0",
  "1.2.0": "v1.2.0", // ← Added during release
  "2.0.0": "v2.0.0", // ← Future major version
};
```

### **Automatic Version Update**

```bash
# During GitHub Actions
# packages/navi-js/scripts/update-version-map.js
const fs = require('fs');
const version = process.env.GITHUB_REF.replace('refs/tags/v', '');

// Add new version to CDN_VERSION_MAP
const sharedFile = 'src/shared.ts';
const content = fs.readFileSync(sharedFile, 'utf8');
const updated = content.replace(
  /CDN_VERSION_MAP = {([^}]+)}/,
  `CDN_VERSION_MAP = {$1  '${version}': 'v${version}',\n}`
);
fs.writeFileSync(sharedFile, updated);
```

## 🚨 Rollback Procedures

### **CDN Rollback**

```bash
# Revert latest pointer to previous version
gsutil cp gs://cdn-navi-com/v1.1.0/navi-loader.js \
  gs://cdn-navi-com/v1/navi-loader.js

# Invalidate CDN cache
gcloud compute url-maps invalidate-cdn-cache cdn-navi-map \
  --path="/v1/navi-loader.js"
```

### **NPM Rollback**

```bash
# Deprecate problematic version
npm deprecate @awell-health/navi-js@1.2.0 "Critical bug - use 1.1.0"

# Customers can downgrade
npm install @awell-health/navi-js@1.1.0
```

### **Emergency Procedures**

1. **Immediate**: Revert CDN latest pointer
2. **Short-term**: Deprecate NPM packages
3. **Medium-term**: Fix issues and patch release
4. **Long-term**: Post-mortem and process improvement

## 📊 Release Monitoring

### **Metrics to Track**

- **CDN Performance**: Request latency, cache hit rates
- **NPM Downloads**: Adoption rate of new versions
- **Error Rates**: Customer integration failures
- **Customer Feedback**: Support tickets, GitHub issues

### **Success Criteria**

- ✅ CDN availability > 99.9%
- ✅ NPM publish success rate > 99%
- ✅ Zero customer-reported integration breaks
- ✅ Performance budgets maintained
- ✅ Security vulnerabilities < 24h resolution

### **Automated Monitoring**

```yaml
# GitHub Actions - Post-release monitoring
monitoring:
  - Check CDN response times (< 200ms global)
  - Verify NPM package integrity
  - Test integration from customer perspective
  - Monitor error rates in Sentry/DataDog
  - Alert team if thresholds exceeded
```

## 🗓️ Release Schedule

### **Regular Release Cycle**

- **Patch releases**: As needed (hotfixes, security)
- **Minor releases**: Every 2-4 weeks (features)
- **Major releases**: Every 6-12 months (breaking changes)

### **Emergency Releases**

- **Security patches**: Within 24 hours
- **Critical bugs**: Within 48 hours
- **Customer-blocking issues**: Within 1 week

### **Pre-release Testing**

- **Beta versions**: 1 week before minor/major releases
- **Customer feedback**: Early access program
- **Integration testing**: Partner customer validation

## 📞 Communication Strategy

### **Customer Notifications**

- **Major releases**: 2+ weeks advance notice
- **Minor releases**: Release notes in GitHub
- **Patch releases**: Automated changelog
- **Emergency fixes**: Direct customer communication

### **Documentation Updates**

- **Migration guides**: For breaking changes
- **API documentation**: Always current
- **Version compatibility**: Matrix in docs
- **Examples**: Updated for new features

---

## 🔧 Implementation Checklist

### **Current State Assessment**

- [ ] GitHub Actions workflow exists
- [ ] CDN infrastructure set up
- [ ] NPM publishing configured
- [ ] Monitoring dashboards created
- [ ] Documentation pipeline established

### **Phase 1: Basic Pipeline (Week 1-2)**

- [ ] Create GitHub Actions workflow
- [ ] Set up CDN deployment scripts
- [ ] Configure NPM publishing
- [ ] Basic smoke tests

### **Phase 2: Advanced Features (Week 3-4)**

- [ ] Version mapping automation
- [ ] Rollback procedures
- [ ] Monitoring and alerting
- [ ] Customer communication automation

### **Phase 3: Optimization (Week 5-6)**

- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation completion
- [ ] Team training

This pipeline ensures reliable, coordinated releases while maintaining the complex dependencies in our Stripe-like architecture! 🚀
