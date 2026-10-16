---
topic: react/routing
difficulty: medium
type: short-answer
tags: [react, routing, spa, react-router, interview-favourite, mosh-react]
source: mosh-react-s06
---

## Question
In a React app with routing, why use `<Link to="/products">` instead of `<a href="/products">`? What does a "single-page application" mean here, and how does `Link` work?

## Answer
A plain `<a href>` makes the browser do a **full page load**: it requests the
HTML again, re-downloads (or revalidates) the JavaScript bundle, and starts
the app from scratch, losing all in-memory state. You can see the requests
in the Network tab.

In a **single-page application (SPA)**, like Gmail, all the components are
**already in the bundle**. Moving between "pages" should just swap what's
in the content area.

**`<Link>`** renders a real `<a>`, so it's accessible, can be opened in a new
tab and has a proper `href`. Its click handler, though,
**prevents the default navigation**, updates the URL with the History API
(`pushState`), and lets the router render the matching route. No request
goes to the server.

Use `<Link>` (or `<NavLink>`) for every internal link, including ones
inside tables. A stray `<a href>` quietly brings back full reloads.

## Key points
- <a href> triggers a full reload: HTML, bundle, lost state
- SPA: components are already loaded; only the content area changes
- Link renders an <a> but prevents default and uses pushState
- use Link/NavLink for all internal navigation
