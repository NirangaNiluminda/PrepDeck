---
topic: react/backend-services
difficulty: medium
type: code
tags: [react, http, state, immutability, crud, mosh-react]
source: mosh-react-s08
---

## Question
Implement add, update and delete handlers for a posts table backed by `/api/posts`. Each one calls the API and then updates the list in state.

## Answer
```jsx
const apiEndpoint = `${config.apiUrl}/posts`;

const handleAdd = async () => {
  const { data: post } = await http.post(apiEndpoint, { title: 'a', body: 'b' });
  setPosts([post, ...posts]);   // the server's response includes the new id
};

const handleUpdate = async (post) => {
  const updated = { ...post, title: 'UPDATED' };
  await http.put(`${apiEndpoint}/${post.id}`, updated);
  setPosts(posts.map(p => (p.id === post.id ? updated : p)));
};

const handleDelete = async (post) => {
  await http.delete(`${apiEndpoint}/${post.id}`);
  setPosts(posts.filter(p => p.id !== post.id));
};
```

- **Create**: POST the object (no id), and use the **response** (the server
  assigns the id) to add it to the list.
- **Update/Delete**: target the item URL `…/posts/:id`. DELETE needs no body.
- State updates are always **new arrays** (`[x, ...posts]`, `map`, `filter`),
  never mutations.
- This is the **pessimistic** order: server first, then UI. The UI waits for
  the round trip, but a failure leaves it untouched.

## Key points
- POST to the collection; add the returned object (with its id) to state
- PUT/PATCH/DELETE target collection/:id
- update the list immutably: spread, map, filter
- server first, then UI = pessimistic update
