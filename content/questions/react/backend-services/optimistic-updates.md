---
topic: react/backend-services
difficulty: medium
type: code
tags: [react, http, ux, state, optimistic-ui, interview-favourite, mosh-react]
source: mosh-react-s08
---

## Question
Deleting a post takes about a second before the row disappears, because the code waits for the server first. What's the difference between pessimistic and optimistic updates? Rewrite delete optimistically, with a rollback on failure.

## Answer
- **Pessimistic:** call the server, *then* update the UI. Always correct,
  but the user waits for every round trip.
- **Optimistic:** assume success (it usually is), **update the UI first**,
  then call the server, and **revert if it fails**. The app *feels* instant.

```jsx
const handleDelete = async (post) => {
  const originalPosts = posts;                     // keep a reference to the old state
  setPosts(posts.filter(p => p.id !== post.id));   // 1. update the UI immediately

  try {
    await http.delete(`${apiEndpoint}/${post.id}`); // 2. then tell the server
  } catch (ex) {
    if (ex.response?.status === 404) toast.error('This post has already been deleted.');
    setPosts(originalPosts);                        // 3. undo on failure
  }
};
```

Rollback is trivial **because state is never mutated**: `originalPosts` is
still the untouched previous array.

Use optimistic updates for low-risk, usually-successful actions: likes,
deletes, toggles. Stay pessimistic where a false "success" would mislead,
such as payments. **Today**, TanStack Query's mutations offer
`onMutate`/`onError` hooks for exactly this pattern.

## Key points
- pessimistic: server first, then UI (slow but safe)
- optimistic: UI first, then server; revert on error (feels instant)
- keep a reference to the previous state; immutability makes rollback trivial
- show an error when rolling back
- use optimistic updates for low-risk actions
