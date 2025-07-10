# Logging & Analytics

## 1. Log Content (Edge & Backend)
| Field            | Included | Rationale |
|------------------|----------|-----------|
| `timestamp`      | ✓ |
| `traceId`        | ✓ |
| `sessionId`      | ✓ | Non-PHI identifier |
| `patientId`      | ✓ | Sanitised; internal ID only |
| `orgId`          | ✓ |
| Request details  | ✓ | path, method, status, latency |
| `componentKey`   | ✓ | enables perf per-component |
| PHI (name, DOB…) | **✗** |

## 2. Storage & Retention
* **Cloud Logging** → sink to **BigQuery** `raw_portal_logs_*` (14-day TTL).
* Nightly scheduled query aggregates into `analytics_web_vitals`, `analytics_usage`.
* Customer-scoped **Authorized Views** expose only `orgId`-filtered data.

## 3. Optional GA4 / Mixpanel
* Config flag `enableThirdPartyAnalytics` per org.
* If enabled, inject GA4 tag with **org-specific property ID**.