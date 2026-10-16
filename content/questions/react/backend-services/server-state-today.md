---
topic: react/backend-services
difficulty: medium
type: short-answer
tags: [react, data-fetching, tanstack-query, server-state, interview-favourite]
source: mosh-react-s08
---

## Question
Hand-written fetching with `useEffect` + `useState` works, but what does it leave out? How do most React apps fetch server data today?

## Answer
A hand-rolled effect makes you build everything yourself, and usually leaves
out:
- **loading and error states** (the course shows neither a spinner nor an
  error screen)
- **caching**: revisiting a page refetches from scratch
- **deduplication**: two components needing the same data make two requests
- **race conditions**: a slow old response overwriting a newer one
- **refetching** on window focus or reconnect, plus retries and pagination

**Today** that's handled by a **server-state library**, most commonly
**TanStack Query** (React Query), or SWR:

```jsx
const { data: movies = [], isPending, error } = useQuery({
  queryKey: ['movies'],
  queryFn: () => http.get('/movies').then(r => r.data),
});

const deleteMovie = useMutation({
  mutationFn: (id) => http.delete(`/movies/${id}`),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['movies'] }),
});
```

Frameworks also fetch on the **server**: Next.js server components, and React
Router loaders. Either way, keep **server data** (cached copies of what the
backend owns) separate from **UI state** (what's open or selected, what's
typed in a form).

## Key points
- manual effects miss loading/error states, caching, dedup, race handling
- TanStack Query (or SWR): useQuery for reads, useMutation for writes
- invalidate queries after a mutation to refresh the data
- frameworks can fetch on the server (Next.js, router loaders)
- keep server state separate from UI state
