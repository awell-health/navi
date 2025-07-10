# Internationalisation & Content

## 1. Translation Workflow
* Source-of-truth on **Localazy**; ICU message syntax.
* Build script pulls latest JSON per locale (`/locales/{lang}.json`) at deploy time.

## 2. Runtime Locale Resolution
1. Detect from query `?lang=`, else cookie `awell.lang`, else `Accept-Language`.
2. If detected locale ≠ loaded bundle, lazy-load via `next-intl` dynamic import.

## 3. RTL Support
* Layout primitives must flip when `dir="rtl"`.
* Test suites must include Arabic (`ar`) smoke tests.

## 4. Content Safety
* Translate only UI strings—never PHI or patient-authored text on the client.