---
topic: react/routing
difficulty: medium
type: code
tags: [react, routing, react-router, nested-routes, mosh-react]
source: mosh-react-s06
---

## Question
An admin dashboard has a sidebar with links to `/admin/posts` and `/admin/users`, and the selected page appears next to the sidebar. Implement these nested routes.

## Answer
**v6+:** declare the children **inside** the parent route, and mark where
they render with **`<Outlet />`**:

```jsx
// App routes
<Route path="/admin" element={<Dashboard />}>
  <Route path="posts" element={<Posts />} />   {/* relative: /admin/posts */}
  <Route path="users" element={<Users />} />
</Route>

// Dashboard.jsx
import { Link, Outlet } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="row">
      <ul className="col-3">           {/* could be its own Sidebar component */}
        <li><Link to="posts">Posts</Link></li>
        <li><Link to="users">Users</Link></li>
      </ul>
      <div className="col">
        <Outlet />                       {/* the matching child renders here */}
      </div>
    </div>
  );
}
```

**Course (v4):** a `Route` is just a component and can go anywhere, so
`Dashboard` itself rendered `<Route path="/admin/users" component={Users} />`
next to the sidebar, using full paths.

## Key points
- nested <Route> children inside the parent route
- <Outlet /> marks where the matched child renders
- child paths and links can be relative (posts, users)
- v4: Routes placed inside the child component, with full paths
