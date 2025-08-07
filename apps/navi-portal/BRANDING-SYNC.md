# Branding Sync

## Overview

Branding data flows from **KV Store** (read/write) to **Edge Config** (fast reads) via automated sync.

## Architecture

```
User Updates → KV Store + Edge Config (immediate) → Production Reads
                    ↓
               Daily Cron (backup sync)
```

- **KV Store**: Dynamic updates via `/api/branding/store` (POST/GET/DELETE)
- **Edge Config**: Ultra-fast reads (<20ms) for production + immediate updates
- **Cron Job**: Daily backup sync at 2 AM UTC (`/api/cron/sync-branding`)

## Environment Variables

```bash
# Required
EDGE_CONFIG_URL=https://edge-config.vercel.com/{id}?token={token}
VERCEL_API_TOKEN=your_vercel_api_token
CRON_SECRET=your_random_secret

# Optional
VERCEL_TEAM_ID=your_team_id
```

## Data Structure

**KV Store**: `branding:{orgId}` → `OrgBranding["branding"]`  
**Edge Config**: `branding.{orgId}` → `OrgBranding["branding"]`

## Manual Sync

```bash
curl -X POST /api/cron/sync-branding \
  -H "Authorization: Bearer $CRON_SECRET"
```
