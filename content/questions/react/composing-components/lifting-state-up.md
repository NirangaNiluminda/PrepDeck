---
topic: react/composing-components
difficulty: medium
type: short-answer
tags: [react, state, architecture, interview-favourite, mosh-react]
source: mosh-react-s04
---

## Question
A `Navbar` must show how many counters have a value above 0, but the counters live in the state of `Counters`, which is a sibling of `Navbar`, not its parent. How do you keep them in sync?

## Answer
**Lift the state up** to the closest common parent, here `App`. Move the
counters array **and every function that changes it** (`handleIncrement`,
`handleDelete`, `handleReset`) into `App`, then pass data and callbacks down
to both children:

```jsx
function App() {
  const [counters, setCounters] = useState(initialCounters);
  // handleIncrement, handleDelete, handleReset live here now

  return (
    <>
      <Navbar totalCounters={counters.filter(c => c.value > 0).length} />
      <Counters
        counters={counters}
        onIncrement={handleIncrement}
        onDelete={handleDelete}
        onReset={handleReset}
      />
    </>
  );
}
```

`Counters` now just passes events through (`onDelete={onDelete}`) to each
`Counter`; it has no state of its own. One owner, many readers: both siblings
stay in sync automatically. Give `Navbar` only what it needs (a number,
already computed) rather than the whole array.

When state must be shared very widely and lifting it would mean passing props
through many layers ("prop drilling"), the next step is **Context** or a state
library.

## Key points
- siblings can't share state directly
- move state and its updaters to the closest common parent
- pass data down as props and callbacks down as event props
- deep sharing: Context or a state library avoids prop drilling
