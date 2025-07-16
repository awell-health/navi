# Navi Monorepo Changesets Guide

## 🚀 Quick Start

```bash
# 1. Add a changeset after making changes
pnpm changeset

# 2. Update package versions (when ready to release)
pnpm changeset:version

# 3. Publish to NPM (CI/CD typically handles this)
pnpm changeset:publish
```

## 📦 Package Coordination

Our packages are **linked** for coordinated releases:

```
@awell-health/navi-core        (foundation)
@awell-health/navi-dot-js      (CDN SDK)
@awell-health/navi-js          (NPM wrapper)
@awell-health/navi-js-react    (React components)
```

**Why linked?** Changes to core types or APIs typically require updates across all packages to maintain compatibility.

## 🔄 Dependency Flow

```
navi-core → navi-portal → navi.js → navi-js/navi-react
(types)      (embed)      (CDN)     (customer APIs)
```

## 📝 Writing Good Changesets

### **Patch Changes** (Bug fixes, internal improvements)

```markdown
---
"@awell-health/navi-core": patch
---

Fix activity event type inference for TypeScript strict mode
```

### **Minor Changes** (New features, backward compatible)

```markdown
---
"@awell-health/navi-core": minor
"@awell-health/navi-dot-js": minor
"@awell-health/navi-js": minor
---

Add support for custom activity validation rules

- New `ActivityValidator` interface in navi-core
- navi.js SDK supports custom validation callbacks
- Maintains backward compatibility with existing flows
```

### **Major Changes** (Breaking changes - coordinate first!)

````markdown
---
"@awell-health/navi-core": major
"@awell-health/navi-dot-js": major
"@awell-health/navi-js": major
"@awell-health/navi-js-react": major
---

BREAKING: Rename activity event types for consistency

- `activity-data-change` → `activity-data-changed`
- `activity-complete` → `activity-completed`
- Updates SDK event listeners and React hooks

Migration:

```js
// Before
navi.on("activity-data-change", callback);

// After
navi.on("activity-data-changed", callback);
```
````

## 🎯 Release Strategy (v0.x.x Development Phase)

### **Current Phase Rules**

- ✅ Breaking changes are **acceptable**
- ⚠️ **Coordination required** - Ask before major changes
- 🔄 All linked packages bump together
- 📋 Update API contracts before breaking changes

### **Release Order** (Automatic via linked packages)

1. **navi-core** (if changed)
2. **navi-dot-js** (CDN deployment required)
3. **navi-js** (update CDN version mapping)
4. **navi-react** (if changed)

_Note: navi-portal is ignored (private app)_

## 🧪 Testing Before Release

```bash
# Always test the full integration flow
pnpm dev  # Starts localhost:3000 and localhost:3001

# Verify:
# 1. Cross-origin messaging works (3001 → 3000)
# 2. Event data structures correct
# 3. Bundle sizes within budget (15KB for navi.js)
# 4. TypeScript compilation across packages
```

## 🔒 Bundle Size Monitoring

Track these during changesets:

- `navi.js` (CDN): **15KB gzipped max**
- `navi-js` (wrapper): **2KB gzipped max**
- `navi-react`: **40KB per component max**

## 📋 Changeset Checklist

- [ ] Changes tested across affected packages
- [ ] Bundle sizes within budget
- [ ] Cross-origin integration tested
- [ ] API contracts updated if breaking
- [ ] Performance budgets met
- [ ] Documentation updated

## 🚨 Common Gotchas

### **Event Name Consistency**

When changing activity events, update:

1. `navi-core/types/activity-event.ts`
2. `navi-portal/use-activity-events.tsx`
3. `navi.js/src/index.ts` event handling
4. Customer documentation

### **CDN Deployment Coordination**

- `navi.js` changes require CDN deployment
- `navi-js` needs CDN version mapping update
- Test with `./scripts/deploy-cdn.sh` before release

### **TypeScript Dependencies**

- Core type changes affect all packages
- Run `pnpm build:packages` to verify compilation
- Update `@types` in consuming packages if needed

## 🎓 Example Workflows

### **Adding New Activity Type**

```bash
# 1. Add types to navi-core
# 2. Update portal components
# 3. Add SDK support in navi.js
# 4. Update React hooks

pnpm changeset
# Select: navi-core (minor), navi-dot-js (minor), navi-js (minor), navi-react (minor)
```

### **Bug Fix in Single Package**

```bash
# Fix isolated to one package
pnpm changeset
# Select: only affected package (patch)
```

### **Breaking API Change**

```bash
# 1. Update API-CONTRACTS.md first
# 2. Coordinate with team
# 3. Implement across packages
# 4. Update integration tests

pnpm changeset
# Select: all packages (major), write migration guide
```

## 🔧 Configuration Details

Our `.changeset/config.json` is configured for:

- **Linked releases**: All packages bump together for coordination
- **Public access**: Packages are published to NPM publicly
- **Minor internal deps**: When packages depend on each other
- **Ignores navi-portal**: Private app not published
- **Main branch**: Releases from main branch

---

## 📞 Need Help?

- Review `docs/RELEASE-PIPELINE.md` for detailed workflows
- Check `docs/API-CONTRACTS.md` for compatibility tracking
- Ask before major breaking changes during v0.x.x phase
