---
topic: react/advanced
difficulty: medium
type: short-answer
tags: [react, hooks, useeffect, interview-favourite, mosh-react]
source: mosh-react-s11
---

## Question
When does an effect run with no dependency array, with `[]`, and with `[a, b]`? When does its cleanup run?

## Answer
In a class, related logic was split across **three** lifecycle methods
(`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`).
`useEffect` keeps it in **one place**, and the dependency array controls when
it runs:

| Written as | Runs |
|---|---|
| `useEffect(fn)` (**no array**) | after **every** render |
| `useEffect(fn, [])` | **once**, after the first render (mount) |
| `useEffect(fn, [a, b])` | after the first render, then again **whenever `a` or `b` changes** (compared with `Object.is`) |

If `fn` **returns a function**, that's the **cleanup**. React runs it
**before the effect runs again** and when the component **unmounts**:

```jsx
useEffect(() => {
  document.title = title;
  return () => console.log('clean up'); // before the next run, and on unmount
}, [title]);
```

Effects run **after** React has updated the DOM. The dependency array must
list **every value from the component that the effect uses** (props, state,
functions). Leave one out and the lint rule warns: *"React Hook useEffect has
a missing dependency: 'name'. Either include it or remove the dependency
array."* Ignoring it gives the effect stale values.

Running cleanup and setup on every render can be expensive, e.g. dropping
and re-opening a network connection on every keystroke. That's what the
dependency array prevents.

## Key points
- no array: after every render
- []: once, on mount
- [deps]: on mount and whenever a dependency changes
- the returned function is the cleanup: before the next run and on unmount
- list every value the effect uses (exhaustive-deps)
