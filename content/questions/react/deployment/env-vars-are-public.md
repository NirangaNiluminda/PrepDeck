---
topic: react/deployment
difficulty: medium
type: mcq
tags: [react, deployment, environment-variables, security, interview-favourite, mosh-react]
source: mosh-react-s10
---

## Question
You put `VITE_STRIPE_SECRET_KEY=sk_live_…` in `.env.production` and read it in a React component. What's wrong?

## Options
- [ ] Nothing: `.env` files are never uploaded, so the key stays private
- [ ] It only works if the file is committed to Git
- [x] Frontend env vars are inlined into the JavaScript bundle at build time, so anyone can read the secret key in the browser
- [ ] Vite encrypts `VITE_` variables, so it's safe

## Answer
**The key ends up in the public bundle.** At **build time**, every
reference like `import.meta.env.VITE_…` (`process.env.REACT_APP_…` in CRA) is
**replaced with its literal value**. The course demonstrates this by finding
the value as plain text in `bundle.js` in DevTools. Every visitor downloads
that bundle.

So frontend env vars are **configuration, not secrets**: API base URLs,
public keys, feature flags. Secret keys (payment, database, JWT signing)
belong **only on the server**. Call your own backend, or a serverless
function, which uses the secret on your behalf.

## Key points
- frontend env vars are substituted into the bundle at build time
- anything in the bundle is public
- only put public configuration there (URLs, publishable keys)
- secrets stay on the server; the frontend calls an API that uses them
