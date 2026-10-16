---
topic: react/deployment
difficulty: medium
type: short-answer
tags: [react, deployment, build, performance, mosh-react]
source: mosh-react-s10
---

## Question
What's the difference between the bundle served by `npm start` / `npm run dev` and the one from `npm run build`? What does the build produce, and how do you test it locally?

## Answer
**Development** (`npm run dev`, or `npm start` in CRA) is built for
**debugging**: unminified code, readable component names, extra runtime
warnings and checks, hot reloading. It's bigger and slower on purpose.

**Production** (`npm run build`) is **optimised**:
- **minified** and **tree-shaken** (unused code removed)
- development-only checks and warnings stripped
- assets with **hashed filenames** (`index-3f9a.js`), so they can be cached
  forever, while a new deploy gets new names
- code splitting into chunks where configured

The output is a folder of **static files**: `dist/` in Vite, `build/` in CRA.
`index.html`, JS, CSS and images can be deployed to **any static host or
CDN**.

**Test the production build locally** before deploying:
- Vite: `npm run build && npm run preview`
- CRA (the course): `npm i -g serve`, then `serve -s build`. `-s` means
  *single-page app*: unknown paths fall back to `index.html`, so client
  routes work on refresh.

Environment variables are baked in **during the build**, so a production build
picks up the `.env.production` values.

## Key points
- dev build: unminified, warnings, hot reload, for debugging
- prod build: minified, tree-shaken, hashed assets, no dev checks
- output is static files (dist/ or build/) for any host or CDN
- preview locally: vite preview, or serve -s build (SPA fallback)
- env values are fixed at build time
