---
topic: react/components
difficulty: medium
type: short-answer
tags: [react, state, rendering, hooks, interview-favourite, mosh-react]
source: mosh-react-s03
---

## Question
Right after calling `setCount(count + 1)`, `console.log(count)` still shows the old value. Why? What actually happens after a state update, and how do you safely update state based on its previous value?

## Answer
A state update doesn't change the variable in place. It **schedules** a
re-render. React **batches** updates and renders later; "later" is
milliseconds, but not *now*. Within the current function, `count` is still
the value from **this** render.

What happens next:
1. React re-runs the component, producing a **new element tree**.
2. It diffs that against the previous tree.
3. It patches only the changed DOM nodes. In the course's demo, clicking
   Increment updates **only the `<span>`** showing the count; the button and
   wrapper are untouched.

When the new value depends on the old one, use the **updater form**. It
receives the latest value even when several updates are queued:

```jsx
setCount(c => c + 1);
setCount(c => c + 1); // +2 in total; two setCount(count + 1) calls give +1
```

## Key points
- setState/setCount schedules a re-render; it doesn't update immediately
- updates are batched, and state is fixed for the current render
- re-render, diff, update only the changed DOM nodes
- use the updater form setX(prev => …) when building on the previous value
