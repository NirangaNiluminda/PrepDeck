---
topic: react/advanced
difficulty: medium
type: mcq
tags: [react, hooks, useeffect, data-fetching, bugs, interview-favourite, mosh-react]
source: mosh-react-s11
---

## Question
What's wrong with this component?

```jsx
function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function getUsers() {
      const result = await axios('https://jsonplaceholder.typicode.com/users');
      setUsers(result.data);
    }
    getUsers();
  });

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

## Options
- [ ] `async` functions can't be defined inside an effect
- [ ] `axios(url)` isn't valid; it must be `axios.get(url)`
- [x] With no dependency array, the effect runs after every render: each response sets new state, which re-renders, which fetches again, forever
- [ ] Nothing; React caches the request automatically

## Answer
**It fetches in an infinite loop.** An effect with **no dependency array** runs
after **every** render. `setUsers(result.data)` stores a **new array** each
time, React re-renders, the effect fires again, and so on. The Network tab
fills with requests.

**Fix:** run it once, on mount, with **`[]`** (or with the real dependencies,
such as a `userId`):

```jsx
useEffect(() => {
  let ignore = false;
  async function getUsers() {
    const { data } = await axios.get(url);
    if (!ignore) setUsers(data);
  }
  getUsers();
  return () => { ignore = true; };   // don't set state from a stale or unmounted request
}, []);
```

The async-function-inside-the-effect pattern is right: the effect callback
itself must not be `async`. `axios(url)` is valid shorthand for a GET.

## Key points
- no deps array + setState in the effect = an infinite render/fetch loop
- fetch once with [], or when specific deps change
- define the async function inside the effect; don't make the callback async
- ignore results that arrive after cleanup
