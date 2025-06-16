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
- All component styles **must resolve to CSS custom properties** (`var(--token)`). No literal color codes, font sizes, or radii are allowed inside component CSS.
- Token names are the public contract; changing or removing a token is a breaking change and requires a major version bump of the design‑system package.

## 4. Token Validation Pipeline
1. `theme-publish.js` script receives a JSON blob and validates schema.
2. If validation passes, the blob is stored in Vercel Edge Config under `branding/{orgId}`.
3. The script writes a `theme.<orgId>.css` artifact for visual regression snapshots (Chromatic).

## 5. Usage Outside This App
External web apps (Module Federation hosts) can:
1. Load the design‑system remote container.
2. Inject the same `<style id="awell-theme">:root{--primary:...}</style>` tag (or include `?orgId=` in the script URL to let the container fetch it).
3. Because all utilities resolve to CSS variables, remote components automatically inherit the host's theme.
