# CDN Setup Summary

## 🌐 Current Infrastructure

**Live URL**: `https://cdn.awellhealth.com/alpha/navi.js` (6.3 KB)

### Architecture Stack

- **Domain**: `cdn.awellhealth.com` (SSL managed by Google)
- **Load Balancer**: `navi-js-load-balancer` (Global, HTTPS)
- **Storage**: `gs://navi-js/alpha/` (GCP bucket, public access)
- **CDN**: 5-minute cache, global distribution

### Cache Configuration

```
Client TTL: 5 minutes
Default TTL: 5 minutes
Max TTL: 30 minutes
Negative cache: 1 second (404s)
```

## 🚀 Deployment Flow

```
packages/navi.js/src/ → Build → gs://navi-js/alpha/navi.js → CDN → Customers
```

## 📋 Current Status

- ✅ **SSL Certificate**: Active until Oct 13, 2025
- ✅ **CDN**: Operational with global distribution
- ✅ **Alpha Version**: Single file deployment
- 🟡 **Versioning**: Not implemented (alpha phase only)
- 🟡 **CI/CD**: Manual deployment process

## 🎯 Customer Integration

```html
<script src="https://cdn.awellhealth.com/alpha/navi.js"></script>
<script>
  const navi = window.navi.create({ apiKey: "...", containerId: "app" });
</script>
```

**CSP Requirements**:

```
script-src 'self' https://cdn.awellhealth.com;
frame-src https://navi-portal.awellhealth.com;
```

## 📊 Performance Targets

- **Bundle Size**: 6.3 KB current / 15 KB max
- **Cache Hit Ratio**: Target >90%
- **First Load**: <500ms (CDN edge)
- **Subsequent**: <50ms (cached)

## 🔄 Next Steps

### Immediate (v0.x.x)

- [ ] Automate deployment pipeline
- [ ] Add staging environment (`/beta/navi.js`)
- [ ] Implement cache purging workflow

### Future (v1.0+)

- [ ] Version management (`/v1.0.0/navi.js`)
- [ ] Analytics and monitoring dashboard
- [ ] Multi-region optimization

## ⚠️ Known Limitations

1. **Single Environment**: Only alpha channel available
2. **Manual Deployment**: No automated CI/CD
3. **Cache Delay**: 5-minute propagation for updates
4. **No Rollback**: Manual process to revert versions

## 🛠️ Operations

**Deploy New Version**:

1. Build `packages/navi.js/`
2. Upload to `gs://navi-js/alpha/navi.js`
3. Wait 5 minutes for cache invalidation
4. Verify at `https://cdn.awellhealth.com/alpha/navi.js`

**Emergency Rollback**:

1. Upload previous version to same path
2. Force cache purge if immediate fix needed
