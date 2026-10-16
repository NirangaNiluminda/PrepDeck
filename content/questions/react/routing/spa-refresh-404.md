---
topic: react/routing
difficulty: medium
type: short-answer
tags: [react, routing, deployment, spa, interview-favourite]
source: mosh-react-s06
---

## Question
A React SPA works when you click around, but refreshing `/movies/42` (or opening it from a bookmark) on the deployed site gives a 404 from the server. Why, and how do you fix it?

## Answer
Client-side routes **exist only in JavaScript**. Clicking a `<Link>` changes
the URL with the History API, with no server involved. But a **refresh or a
pasted URL** asks the **server** for `/movies/42`, and a static host has no
such file, so it returns 404.

**Fix:** configure a **fallback**, so the server returns `index.html` for any
path that isn't a real file. The app then loads and the router renders
`/movies/42`.

- **Vercel** (`vercel.json`): `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`
- **Netlify** (`_redirects`): `/*  /index.html  200`
- **nginx:** `try_files $uri /index.html;`
- **Vite dev server / CRA:** already does this in development, which is why it
  "only breaks in production"

`HashRouter` (`/#/movies/42`) avoids the problem, because the part after `#`
is never sent to the server, but it gives uglier URLs. Frameworks like
**Next.js** render routes on the server, so it doesn't arise.

## Key points
- client routes exist only in JS; a refresh asks the server for that path
- the server must fall back to index.html for unknown paths
- configure rewrites on Vercel, Netlify or nginx
- HashRouter avoids it at the cost of # URLs
