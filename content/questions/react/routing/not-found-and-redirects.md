---
topic: react/routing
difficulty: medium
type: short-answer
tags: [react, routing, react-router, mosh-react]
source: mosh-react-s06
---

## Question
How do you send users to a "Not found" page for unknown URLs, and permanently redirect an old URL (`/messages`) to its new one (`/posts`)?

## Answer
**v6+:**
```jsx
<Routes>
  {/* …real routes… */}
  <Route path="/messages" element={<Navigate to="/posts" replace />} /> {/* moved */}
  <Route path="/not-found" element={<NotFound />} />
  <Route path="*" element={<Navigate to="/not-found" replace />} />    {/* anything else */}
</Routes>
```

Or just render `<NotFound />` directly at `path="*"`. That keeps the bad
URL visible instead of redirecting away from it.

`replace` swaps the current history entry instead of adding one, so **Back**
doesn't bounce the user straight into the redirect again.

**Course (v4):** `<Redirect from="/messages" to="/posts" />` for moved URLs,
and a final, unconditional `<Redirect to="/not-found" />` as the last child
of `<Switch>`. Since v4 matched by prefix, `<Redirect from="/" exact
to="/movies" />` needed `exact`, or every URL would redirect to movies.

## Key points
- catch-all: path="*" renders NotFound or <Navigate to="/not-found" />
- moved URLs: a route whose element is <Navigate to=… replace />
- replace avoids a Back-button redirect loop
- v4: <Redirect from to />, with a final catch-all Redirect in Switch
