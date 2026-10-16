---
topic: react/components
difficulty: easy
type: short-answer
tags: [react, jsx, state, mosh-react]
source: mosh-react-s03
---

## Question
How do you display a dynamic value inside JSX? What can and can't go between the curly braces? Show a component that renders its count, or the word "Zero" when the count is 0.

## Answer
Curly braces `{ }` in JSX take **any JavaScript expression**, meaning
anything that **produces a value**: a variable, arithmetic like `{2 + 2}`, a
function call, a ternary, or even more JSX. **Statements** such as `if`,
`for` or variable declarations are not allowed inside them.

```jsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  const formatCount = () => (count === 0 ? 'Zero' : count);

  return <span className="badge">{formatCount()}</span>;
}
```

JSX elements are ordinary values too: you can return them from a function,
store them in a variable or pass them as arguments, e.g.
`const zero = <h1>Zero</h1>;`.

**Course vs today.** The course keeps data in `this.state = { count: 0 }`
and reads it as `this.state.count`, using destructuring
`const { count } = this.state` to avoid repetition. With hooks, `count` is
simply a local variable.

## Key points
- { } accepts any expression: values, calls, ternaries, JSX
- statements (if, for, declarations) are not allowed inside { }
- JSX elements are values: return, store and pass them
- state holds the data the component renders (useState today)
