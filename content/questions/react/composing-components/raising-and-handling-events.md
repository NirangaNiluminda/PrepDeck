---
topic: react/composing-components
difficulty: medium
type: code
tags: [react, events, props, state, interview-favourite, mosh-react]
source: mosh-react-s04
---

## Question
Each `Counter` has a Delete button, but the list of counters lives in the parent `Counters`. How does clicking Delete in the child remove the item from the parent's state? What's the rule about who modifies state?

## Answer
**Rule: the component that owns a piece of state is the one that modifies
it.** The list belongs to `Counters`, so `Counters` does the deleting. The
child only **raises an event**, i.e. calls a function it received as a
prop:

```jsx
function Counters() {
  const [counters, setCounters] = useState(initialCounters);

  const handleDelete = (counterId) =>
    setCounters(counters.filter(c => c.id !== counterId));

  return counters.map(c => (
    <Counter key={c.id} counter={c} onDelete={handleDelete} />
  ));
}

function Counter({ counter, onDelete }) {
  return <button onClick={() => onDelete(counter.id)}>Delete</button>;
}
```

- Name the prop like an event (**`onDelete`**) and the parent's function
  like a handler (**`handleDelete`**).
- "Events" between components are just **callback props**: data flows
  **down** as props, and requests to change it flow **up** as calls.
- The parent creates a **new** array with `filter`, never mutating the old one.

## Key points
- the owner of the state modifies it
- the child raises an event by calling a callback prop (onDelete)
- the parent handles it (handleDelete) and updates its own state
- data down via props, changes up via callbacks
