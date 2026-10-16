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
functions); the `react-hooks/exhaustive-deps` lint rule checks it. Leaving one
out gives the effect stale values.

## Key points
- no array: after every render
- []: once, on mount
- [deps]: on mount and whenever a dependency changes
- the returned function is the cleanup: before the next run and on unmount
- list every value the effect uses (exhaustive-deps)
