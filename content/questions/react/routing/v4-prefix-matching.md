---
topic: react/routing
difficulty: medium
type: mcq
tags: [react, routing, react-router, mosh-react]
source: mosh-react-s06
---

## Question
In React Router v4, routes `path="/products"` and `path="/"` are rendered side by side (no `Switch`). Visiting `/products` shows **both** the Products page and the Home page. Why?

## Options
- [ ] `/products` is invalid without a trailing slash
- [x] v4 matches routes by prefix: `/products` starts with `/`, so both routes match; fix with `exact` on `/` or wrap the routes in `<Switch>` (most specific first)
- [ ] Two `Route` components can't share a parent
- [ ] Home is the default route and always renders

## Answer
v4's matcher checks whether the URL **starts with** the route's path, and
renders *every* route that matches. `/products` (and `/products/new`)
start with `/`, so Home renders as well. Fixes: `exact` on `/`, or
`<Switch>`, which renders only the **first** match. That's why routes
under `Switch` were ordered **from most specific to most general**.

**Today (v6+)** this whole class of bug is gone: `<Routes>` scores every
route and picks the **single best match**, regardless of order, so there's
no `exact` and no `Switch`.

## Key points
- v4: prefix matching, every matching Route renders
- fixes: exact, or Switch (first match) with specific routes first
- v6+: Routes picks the best match; order and exact no longer matter
