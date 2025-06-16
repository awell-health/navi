# Module Federation – Design-System Distribution

The design system is compiled into a **remote container** (`remoteEntry.js`) so any host
application—internal or customer-owned—can consume components that automatically adapt
to the same CSS-variable theme.

## 1. Build & Publish

| Step | Command | Output |
|------|---------|--------|
| **Bundle** | `pnpm build:remote` | `dist/remoteEntry.[hash].js` + lazy chunks |
| **Upload** | `pnpm upload:cdn` | `https://cdn.awell.health/navi/vX.Y.Z/remoteEntry.js` |
| **Invalidate** | Edge function `/invalidate-theme` runs if theme tokens changed | Purges CDN + sets new cache-bust hash |

## 2. Webpack Config (remote)

```js
// packages/design-system/webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'naviDS',
      filename: 'remoteEntry.js',
      exposes: {
        './ConsentForm': './src/activities/ConsentForm',
        './ThemeProvider': './src/ThemeProvider'
      },
      shared: {
        react:  { singleton: true, eager: false, requiredVersion: '^19' },
        'react-dom': { singleton: true },
        '@tanstack/react-query': { singleton: true }
      }
    })
  ]
};
```

## 3. Host Integration (customer app)

```js
// webpack.config.js (host)
plugins: [
  new ModuleFederationPlugin({
    remotes: {
      naviDS: 'naviDS@https://cdn.awell.health/navi/vX.Y.Z/remoteEntry.js'
    },
    shared: { 
      react: { singleton: true, requiredVersion: '^19' },
      'react-dom': { singleton: true }
    }
  })
]
```

```tsx
// In the host React code
import { lazy, Suspense } from 'react';

const ConsentForm = lazy(() => import('naviDS/ConsentForm'));

export default function Page() {
  return (
    <>
      <AwThemeLoader orgId="acme-health" />
      <Suspense fallback={<div>Loading…</div>}>
        <ConsentForm activityId="123" />
      </Suspense>
    </>
  );
}
```

## 4. Token Contract

| CSS Variable | Default value | Purpose |
|--------------|---------------|---------|
| `--primary`  | `#0063F7`     | Accent surfaces and buttons |
| `--radius`   | `6px`         | Border‐radius utilities     |
| `--font-body`| `"Inter", sans-serif` | Body text font |
| _…_          | _…_           | Extendable by theme publisher |

*Changing or removing a token is a **breaking change** &rArr; bump major version.*

## 5. Versioning & Cache Busting

* Remote filenames include semantic version & content hash (`v1.3.0-abcdef`).
* Hosts pin to a range (`v1.3.*`) or exact patch; upgrading is explicit.
* Publishing `v1.4.0` leaves hosts on `v1.3.*` untouched until they update the URL.

## 6. Fallback for Non‑MF Hosts

If a customer cannot enable Module Federation:

1. Ship a UMD bundle: `navi-design-system.umd.js`.
2. Provide a static CSS file with theme tokens: `theme.css`.
3. Customer adds:
   ```html
   <link rel="stylesheet" href="/theme.css">
   <script src="/navi-design-system.umd.js"></script>
   <script>
     NaviDS.mountConsentForm('#root', { activityId: '123' });
   </script>
   ```

This ensures even legacy platforms can render the same brand‑aware components.