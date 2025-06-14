# Performance Budgets & Monitoring

| Metric (4 G Moto G class) | Target | Collection |
|---------------------------|--------|------------|
| First Contentful Paint    | < 1 000 ms | web-vitals in browser |
| Time to Interactive       | < 2 500 ms | web-vitals |
| JS transferred on initial route | < 15 kB gzip | Bundle Analyzer CI gate |
| Activity chunk size       | < 40 kB gzip each | Same as above |

## 1. CI / CD Gates
* **Turbopack** build size budgets break the pipeline if limits exceeded.
* Lighthouse CI runs on mobile preset; PR must not regress P95 metrics >5 %.

## 2. Runtime Instrumentation
* `webVitals()` script posts to `/rum` with `sessionId`, `orgId`, anonymised URL, metrics.
* Edge logs correlate `traceId` with `sessionId` to compute server-side latency.

## 3. Caching Strategy
* HTML shell: `Cache-Control: private, max-age=0, must-revalidate`.
* Branding & manifest: Edge Config with 60 s stale-while-revalidate.
* Activity chunks: `Cache-Control: public, max-age=31536000, immutable`.