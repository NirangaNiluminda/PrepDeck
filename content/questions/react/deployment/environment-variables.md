---
topic: react/deployment
difficulty: medium
type: short-answer
tags: [react, deployment, environment-variables, vite, mosh-react]
source: mosh-react-s10
---

## Question
In development the app should call `http://localhost:3900/api`; in production, the real API. How do you give a React app environment-specific settings, and what are the naming rules?

## Answer
Use **`.env` files** per environment, which the build tool loads automatically:

```
.env               # defaults for every environment
.env.development   # used by the dev server
.env.production    # used by the production build
.env.test          # used when running tests
```

```
# .env.development
VITE_API_URL=http://localhost:3900/api
# .env.production
VITE_API_URL=https://api.myapp.com/api
```

Read the value in code, e.g. to set the HTTP client's base URL:
`axios.defaults.baseURL = import.meta.env.VITE_API_URL;`

**Only variables with the tool's public prefix reach the browser code:**
`VITE_` in Vite, `NEXT_PUBLIC_` in Next.js, `REACT_APP_` in the
**course's Create React App**, where you read them as
`process.env.REACT_APP_API_URL`. The prefix is a safety net so that
unrelated variables on your machine aren't accidentally bundled.

- **Restart the dev server** after editing `.env` files; they aren't watched.
- Built-in values: `import.meta.env.MODE` / `DEV` / `PROD`
  (CRA: `process.env.NODE_ENV`).
- On a host like Vercel or Netlify, set the production values in the
  dashboard instead of committing a `.env.production`.

## Key points
- .env, .env.development, .env.production, .env.test
- prefix required: VITE_ (Vite), NEXT_PUBLIC_ (Next), REACT_APP_ (CRA)
- read via import.meta.env (Vite) or process.env (CRA/Next)
- restart the dev server after changing .env files
- set production values in the hosting dashboard
