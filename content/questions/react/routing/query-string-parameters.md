---
topic: react/routing
difficulty: medium
type: code
tags: [react, routing, react-router, query-string, mosh-react]
source: mosh-react-s06
---

## Question
For the URL `/posts?sortBy=newest&approved=true`, read `sortBy` and `approved` in a React component, and update the query string when the user changes the sort. What type is `approved`?

## Answer
**Today:** `useSearchParams`, which wraps the browser's `URLSearchParams`:

```jsx
import { useSearchParams } from 'react-router-dom';

function Posts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy');                // 'newest'
  const approved = searchParams.get('approved') === 'true'; // convert!

  return (
    <select
      value={sortBy ?? 'newest'}
      onChange={e => setSearchParams({ sortBy: e.target.value, approved: String(approved) })}
    >
      …
    </select>
  );
}
```

**Every query value is a string** (or `null` when missing): `'true'` is not
`true`, and `'2'` is not `2`. Convert explicitly.

**Course (v4):** read the raw string `props.location.search` and parse it
with the `query-string` npm package (`queryString.parse(location.search)`).
That's no longer needed: `URLSearchParams` is built into browsers.

Keeping filter state in the URL means the view can be **bookmarked, shared
and navigated with Back/Forward**.

## Key points
- useSearchParams() gives get/set access to the query string
- values are strings or null; convert booleans and numbers
- v4: parse location.search with the query-string package
- URL state is shareable and works with Back/Forward
