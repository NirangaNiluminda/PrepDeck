---
topic: react/authentication
difficulty: medium
type: code
tags: [react, routing, authentication, react-router, interview-favourite, mosh-react]
source: mosh-react-s09
---

## Question
Anonymous users must not reach `/movies/new` or `/movies/:id`. Send them to `/login`, and after they log in, bring them back to the page they wanted. A logged-in user who visits `/login` should go to the home page. Implement this with today's React Router, and say how the course's v4 version did it.

## Answer
**v6+: a guard component wrapping protected routes**
```jsx
function RequireAuth({ children }) {
  const { user } = useAuth();          // from the auth context
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

<Route path="/movies/:id" element={<RequireAuth><MovieForm /></RequireAuth>} />
```

Or as a **layout route** that guards a group, by rendering `<Outlet />` instead
of `children`:
`<Route element={<RequireAuth />}><Route path="/movies/:id" … /></Route>`.

**Back to where they came from, after login:**
```jsx
const location = useLocation();
const from = location.state?.from?.pathname || '/';
// after a successful login:
navigate(from, { replace: true });

// and at the top of the login page:
if (user) return <Navigate to="/" replace />;
```

**Course (v4):** a reusable `ProtectedRoute` with the same interface as
`Route`. It takes `path`, `component` or `render`, plus `...rest`. Inside
`render`, it returns `<Redirect to={{ pathname: '/login', state: { from:
props.location } }} />` when there's no user, otherwise
`Component ? <Component {...props} /> : render(props)`. The prop is renamed to
`Component` with a capital C because JSX needs capitalised component names.

Route guards are **UX**: the API still enforces access.

## Key points
- a guard renders <Navigate to="/login" state={{ from: location }} /> if no user
- wrap elements, or use a guard layout route with <Outlet />
- after login: navigate(state.from.pathname || '/', { replace: true })
- logged-in users visiting /login are redirected home
- v4: a ProtectedRoute wrapping Route + render + Redirect with location state
