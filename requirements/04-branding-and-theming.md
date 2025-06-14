# Branding & Theming

## 1. Manifest Shape
```json5
{
  "orgId": "acme-health",
  "branding": {
    // flexible KV
    "primaryColor": "#A45128",
    "logoUrl": "https://cdn.awell.health/acme/logo.svg",
    "fontFamily": "Inter",
    "...": "..."
  }
}
```
## 2. Retrieval
- Edge Function reads from Vercel Edge Config key orgId → branding.
- If missing, default theme falls back to @shadcn/ui neutral palette.

## 3. CSS Application
- Critical vars inlined as `:root{--primary:#A45128;--radius:6px}`
- Tailwind and shadcn utility classes consume these CSS variables

