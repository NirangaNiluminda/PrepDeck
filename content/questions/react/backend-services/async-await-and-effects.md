---
topic: react/backend-services
difficulty: medium
type: mcq
tags: [react, async, promises, useeffect, data-fetching, interview-favourite, mosh-react]
source: mosh-react-s08
---

## Question
Which is the correct way to load posts when a function component mounts?

## Options
- [ ] `useEffect(async () => { const { data } = await http.get(url); setPosts(data); }, []);`
- [x] `useEffect(() => { async function load() { const { data } = await http.get(url); setPosts(data); } load(); }, []);`
- [ ] `const { data } = await http.get(url);` at the top of the component body
- [ ] `useEffect(() => { setPosts(http.get(url)); }, []);`

## Answer
**Define an async function inside the effect and call it.** An effect must
return either nothing or a **cleanup function**. An `async` function always
returns a **promise**, so `useEffect(async …)` hands React a promise as its
"cleanup", and React warns about it.

Background:
- `http.get` returns a **promise**: an object for a result that arrives
  later. It starts **pending**, then becomes **fulfilled** with the response
  or **rejected** with an error.
- **`await`** pauses until the promise settles and gives you the value. It's
  only allowed inside an **`async`** function. That replaced chains of
  `.then(...)`.
- `await` at the top of a component body isn't allowed, and would re-run
  every render anyway. `setPosts(http.get(url))` stores the promise itself,
  not the data.

**Course (class):** `async componentDidMount() { const { data: posts } =
await axios.get(url); this.setState({ posts }); }`. Lifecycle methods can be
`async` because React ignores their return value.

## Key points
- effects return nothing or a cleanup, never a promise
- define an async function inside the effect and call it
- promise states: pending, then fulfilled or rejected
- await needs async; it replaces .then chains
- class components: async componentDidMount works
