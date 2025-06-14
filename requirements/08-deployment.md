# Deployment & Infrastructure

## 1. Platform
* **Vercel Edge Functions** with geolocation routing:
  * US traffic → iad1
  * EU traffic → cdg1
  * UK traffic → lhr1

## 2. Project / Environment Layout
| Vercel project | Domain pattern |
|----------------|----------------|
| `portal-prod`  | `*.awell.health` (fallback) |
| `portal-cust`  | `portal.<customer-slug>.com` (CNAME) |

## 3. Build Pipeline
1. Lint, type-check, unit tests.
2. Turbopack build (`edge` target) – enforce bundle budgets.
3. Lighthouse CI (mobile preset) – block on regression.
4. Vercel deploy – promote to Production after canary passes.

## 4. Secrets & Config
* `EDGE_CONFIG_TOKEN` – read-only token for branding manifest.
* `JWT_SIGNING_KEY` – 256-bit secret rotated quarterly.
* `DATABASE_URL` – supabase-style encrypted secret.

## 5. Rollback
* Vercel automatic commit-level rollbacks.
* DB migrations are additive; rollback script to mark new columns nullable.

## 6. Monitoring & Alerts
* Vercel Web Vitals dashboard with custom threshold alerts.
* BigQuery scheduled query raises PagerDuty if median FCP >1.2 s for any org over 30 min window.