---
topic: react/advanced
difficulty: easy
type: code
tags: [react, hooks, usestate, state, mosh-react]
source: mosh-react-s11
---

## Question
Write a function component with a text input for a name and an "Increase" button. It shows "<name> has clicked <count> times!" using `useState`. Explain what `useState` returns.

## Answer
```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);   // [current value, setter]
  const [name, setName] = useState('');    // one call per piece of state

  return (
    <>
      <input value={name} onChange={e => setName(e.target.value)} />
      <div>{name} has clicked {count} times!</div>
      <button onClick={() => setCount(count + 1)}>Increase</button>
    </>
  );
}
```

- `useState(initial)` returns a **pair**: the **current value** and a
  **setter**. It's array destructuring, so you choose the names, conventionally
  `x` and `setX`. (The course's code names one setter `setState`, which is
  legal but confusing.)
- Call it **once per independent piece of state**. Unlike a class's
  `this.state` object, separate values don't need merging.
- Calling the setter **replaces** that value and re-renders. Use
  `setCount(c => c + 1)` when the new value depends on the old one.
- The initial value is used only on the first render. Pass a function,
  `useState(() => expensive())`, to compute it lazily.

## Key points
- useState returns [value, setter]; name them value/setValue
- one call per independent piece of state
- the setter replaces the value and triggers a re-render
- updater form setX(prev => …); lazy initialiser useState(() => …)
