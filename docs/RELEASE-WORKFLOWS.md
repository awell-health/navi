# Navi Release Workflows

This document explains how to use the automated release workflows for the Navi monorepo packages.

## 📦 Packages Published to NPM

- **@awell-health/navi-core** - Core utilities and types
- **@awell-health/navi-js** - NPM wrapper that loads navi.js from CDN
- **@awell-health/navi-js-react** - React components and hooks

> **Note**: `@awell-health/navi-dot-js` is deployed to CDN separately and not published to NPM.

## 🚀 Release Workflows

### 1. Regular Release (Production)

**Workflow**: `.github/workflows/release.yml`

**How it works**:

1. Create a changeset with `pnpm changeset`
2. Commit and push changes
3. Changeset bot creates a "Release: New Navi Package Versions" PR
4. When you merge the PR, packages are automatically published to NPM
5. GitHub release is created automatically

**Example**:

```bash
# Create a changeset
pnpm changeset

# Select packages and change types
# Write a good description
# Commit and push

# Merge the changeset PR when ready → auto-publish!
```

### 2. Alpha Release (Pre-release)

**Workflow**: `.github/workflows/alpha-release.yml`

**How to trigger**:

1. Go to GitHub Actions → "Alpha Release & Publish to NPM"
2. Click "Run workflow"
3. Enter alpha identifier (e.g., "alpha.1", "alpha.2")
4. Packages are published with `-alpha.X` suffix

**Installation of alpha packages**:

```bash
npm install @awell-health/navi-core@alpha
npm install @awell-health/navi-js@alpha
npm install @awell-health/navi-js-react@alpha
```

### 3. Pin navi-js to navi.js Major Version

**Workflow**: `.github/workflows/pin-navi-js-version.yml`

**When to use**: After deploying a new major version of navi.js to CDN

**How to trigger**:

1. Go to GitHub Actions → "Pin navi-js to navi.js Major Version"
2. Click "Run workflow"
3. Enter the navi.js version (e.g., "2.0.0")
4. Select release type (patch/minor/major)
5. Workflow creates a PR with the version pinning changes

**Example**: If navi.js v2.0.0 is deployed to CDN, run this workflow to update navi-js to reference `https://cdn.awellhealth.com/navi/v2/navi.js`

## 🔧 Setup Requirements

### GitHub Secrets

You need to configure these secrets in your GitHub repository:

```
NPM_AWELL_HEALTH_PUBLISHER - Your NPM authentication token for @awell-health org
```

### NPM Token Setup

1. Create an NPM token with "Automation" permission
2. Ensure the token has access to the @awell-health organization
3. Add it as `NPM_AWELL_HEALTH_PUBLISHER` in GitHub repository secrets

## 📋 Version Strategy

### Linked Releases

All packages use **linked releases** via changeset:

- When one package changes, all packages get the same version bump
- Ensures compatibility across the entire SDK
- Simplifies version management for consumers

### Semantic Versioning

- **patch**: Bug fixes, internal improvements
- **minor**: New features, backward compatible changes
- **major**: Breaking changes, API modifications

### Alpha Releases

- Use for testing new features before stable release
- Published with `@alpha` tag on NPM
- Can be installed alongside stable versions

## 🔄 Typical Release Flow

### For Regular Features

1. **Develop** → Create feature branch
2. **Test** → Ensure cross-package compatibility
3. **Changeset** → Run `pnpm changeset` before merging
4. **Merge** → Merge to main (includes changeset)
5. **Release** → Merge changeset PR → auto-publish

### For Breaking Changes (v0.x.x)

1. **Plan** → Coordinate changes across packages
2. **Test** → Test integration thoroughly
3. **Changeset** → Use "major" bump for breaking changes
4. **Document** → Update API contracts and migration guides
5. **Release** → Follow normal release flow

### For navi.js CDN Updates

1. **Deploy** → Deploy navi.js to CDN using existing script
2. **Pin** → Run "Pin navi-js version" workflow
3. **Test** → Verify navi-js loads correct CDN version
4. **Release** → Merge PR and follow release flow

## 🎯 Best Practices

### Changeset Messages

```markdown
# Good changeset description

---

"@awell-health/navi-core": minor
"@awell-health/navi-js": minor  
"@awell-health/navi-js-react": minor

---

Add support for custom validation rules

- Added ValidationRule interface to navi-core
- Updated navi-js to handle validation events
- Added useValidation hook to navi-react
- Improved error handling across all packages
```

### Testing Before Release

```bash
# Always test the full integration
pnpm build:packages

# Test cross-origin functionality
pnpm dev  # localhost:3000 + localhost:3001

# Run tests
pnpm test

# Check types
pnpm tsc --noEmit
```

### Alpha Release Strategy

- Use alpha releases for significant new features
- Test alphas thoroughly in staging environments
- Gather feedback before promoting to stable
- Document alpha limitations clearly

## 🚨 Troubleshooting

### Release Failed

- Check NPM token is valid and has correct permissions
- Verify all packages build successfully
- Ensure changeset format is correct

### Version Misalignment

- All packages should have aligned versions (currently 0.1.0)
- If versions drift, use changeset to realign them

### CDN Pinning Issues

- Verify navi.js was deployed to the correct CDN path
- Check that navi-js source references the correct URL pattern
- Test that the CDN URL actually serves the expected version

---

## 🏥 Healthcare Compliance Note

Remember that all releases should maintain HIPAA compliance and security standards. Review security implications of any changes before releasing.
