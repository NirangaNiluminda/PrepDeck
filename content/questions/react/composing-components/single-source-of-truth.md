---
topic: react/composing-components
difficulty: medium
type: short-answer
tags: [react, state, props, anti-patterns, interview-favourite, mosh-react]
source: mosh-react-s04
---

## Question
Each `Counter` copies its starting value from props into its own state: `useState(props.counter.value)`. The parent has a Reset button that sets every value to 0 in its state, yet the counters on screen don't change. Why, and what's the fix?

## Answer
The initial value passed to state is read **only once, when the component
mounts**. After that, the child's state and the parent's data are two
**separate copies** that drift apart. The parent's array really is reset (you
can see it in React DevTools), but each `Counter` keeps showing its own
private copy. There's **no single source of truth**.

**Fix: keep the data in one place.** Delete the child's local state, render
straight from props, and send changes up as events. The child becomes a
**controlled component**:

```jsx
function Counter({ counter, onIncrement, onDelete }) {
  return (
    <>
      <span>{counter.value}</span>
      <button onClick={() => onIncrement(counter)}>+</button>
      <button onClick={() => onDelete(counter.id)}>Delete</button>
    </>
  );
}
```

Copying props into state is a well-known **anti-pattern**. Do it only when
the prop is deliberately just a starting value, and name it that way
(`initialValue`).

## Key points
- useState(prop) / initialising state from props runs only on mount
- the copies drift apart: two sources of truth
- fix: one owner holds the data; children render props and raise events
- copying props into state is an anti-pattern unless it's truly "initial"
