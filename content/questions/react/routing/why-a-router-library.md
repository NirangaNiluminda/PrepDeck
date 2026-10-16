---
topic: react/routing
difficulty: easy
type: short-answer
tags: [react, routing, react-router, mosh-react]
source: mosh-react-s06
---

## Question
Why doesn't React come with routing built in? What do you install, and what does wrapping the app in `<BrowserRouter>` do?

## Answer
React is a **library that only renders the view**, unlike Angular, which is
a framework with its own router. Routing comes from a separate package,
**React Router**: `react-router-dom` for browsers. A separate React Native
setup exists for mobile.

```jsx
// main.jsx
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

`BrowserRouter` connects React Router to the browser's **History API** and
makes the current location and navigation available to **every component
in the tree**. Without it, routes and links have nothing to work with.

**Today:** React Router v6/v7 also offers a "data router",
`createBrowserRouter` + `<RouterProvider>`, with loaders and actions, and
frameworks like **Next.js** use file-based routing instead.

## Key points
- React only renders, so routing is a separate library: react-router-dom
- BrowserRouter wraps the app and connects to the History API
- it gives every component access to location and navigation
- alternatives today: createBrowserRouter data routers, or Next.js file routing
