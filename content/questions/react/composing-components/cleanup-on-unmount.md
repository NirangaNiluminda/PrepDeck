---
topic: react/composing-components
difficulty: medium
type: short-answer
tags: [react, lifecycle, useeffect, memory-leaks, mosh-react]
source: mosh-react-s04
---

## Question
What should happen when a component is removed from the page, and what goes wrong if you skip it?

## Answer
Just before a component unmounts, React calls **`componentWillUnmount`**, or
the **cleanup function** returned from a `useEffect`. That's where you undo
anything the component set up that lives **outside** React:

- timers: `clearInterval` / `clearTimeout`
- event listeners on `window` or `document`: `removeEventListener`
- subscriptions, WebSockets, observers: unsubscribe or close
- in-flight requests: abort them or ignore their result

```jsx
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
```

Skip it and you get **memory leaks** plus bugs: listeners and timers keep
running for a component that no longer exists, often trying to update its
state.

An effect's cleanup also runs **before the effect re-runs** when its
dependencies change, not only on unmount.

## Key points
- componentWillUnmount / the effect cleanup runs before removal
- clear timers, remove listeners, unsubscribe, abort requests
- skipping it leaks memory and causes updates on dead components
- effect cleanup also runs before each re-run
