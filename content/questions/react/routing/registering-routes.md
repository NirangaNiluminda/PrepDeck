---
topic: react/routing
difficulty: medium
type: code
tags: [react, routing, react-router, mosh-react]
source: mosh-react-s06
---

## Question
Register routes so `/movies`, `/customers` and `/rentals` render their components, `/movies/:id` renders `MovieForm`, `/` redirects to `/movies`, and any unknown URL shows a NotFound page. Show the current React Router API, and how the course's v4 version differs.

## Answer
**React Router v6/v7:**
```jsx
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/movies/:id" element={<MovieForm />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="/" element={<Navigate to="/movies" replace />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </main>
    </>
  );
}
```

`<Routes>` renders **the best match** for the URL, and the order of the
routes doesn't matter. `path="*"` is the catch-all.

**Course (v4):** `<Switch>` instead of `<Routes>`;
`component={Movies}` instead of `element={<Movies />}`; `<Redirect from="/"
exact to="/movies" />` and a final `<Redirect to="/not-found" />`. And
because v4 matched **by prefix, in order**, specific routes had to come
before general ones, and `/` needed `exact`.

## Key points
- <Routes> with <Route path element={<X />} />
- best-match routing in v6+, so order doesn't matter
- <Navigate to … replace /> redirects; path="*" catches everything else
- v4: Switch, component=, Redirect, prefix matching that needed exact/order
