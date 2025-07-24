# Navi Simple Embed Example

A minimal Next.js application demonstrating a full-screen Navi embed using `@awell-health/navi-js` and `@awell-health/navi-js-react`.

## Features

- Full-screen Navi embed using `NaviProvider` and `NaviEmbed`
- Simple, clean implementation with no extra dependencies
- Uses workspace packages from the monorepo

## Getting Started

1. From the monorepo root, install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   cd examples/simple-embed
   pnpm dev
   ```

3. Open [http://localhost:3002](http://localhost:3002) in your browser.

## Usage

The app demonstrates a basic integration:

- `NaviProvider` wraps the app with a publishable key
- `NaviEmbed` renders a full-screen iframe with a care flow
- Event handlers for `onReady` and `onError` are set up

## Dependencies

- `@awell-health/navi-js` - Main SDK (workspace package)
- `@awell-health/navi-js-react` - React components (workspace package)
- `next` - Next.js framework
- `react` & `react-dom` - React runtime
