---
topic: react/routing
difficulty: medium
type: short-answer
tags: [react, routing, react-router, hooks, mosh-react]
source: mosh-react-s06
---

## Question
In React Router v4, a routed component received `history`, `location` and `match` as props. What did each one hold, and how do you get the same information today?

## Answer
| v4 prop | Held | Today (v6+ hook) |
|---|---|---|
| `match` | how the URL matched the route: `match.params` (route parameters), `url`, `path` | **`useParams()`** for the params |
| `location` | where the app is now: `pathname`, `search` (query string), `hash`, `state` | **`useLocation()`**, plus **`useSearchParams()`** for the query string |
| `history` | navigation methods: `push`, `replace`, `goBack` | **`useNavigate()`** |

```jsx
function MovieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <button onClick={() => navigate('/movies')}>Save</button>;
}
```

In v4 only components rendered **directly by a `Route`** got those props.
Deeper components needed the `withRouter` higher-order component. **Hooks
work in any component** under the router, so there's no prop threading and
no HOC.

## Key points
- match = params; location = pathname, search, state; history = navigation
- today: useParams, useLocation, useSearchParams, useNavigate
- v4 injected them only into routed components (withRouter for others)
- hooks work anywhere under the router
