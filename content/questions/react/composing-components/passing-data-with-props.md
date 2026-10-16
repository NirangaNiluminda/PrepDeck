---
topic: react/composing-components
difficulty: easy
type: code
tags: [react, props, components, mosh-react]
source: mosh-react-s04
---

## Question
A `Counters` component holds an array of `{ id, value }` objects and renders one `Counter` per item. How do you pass each counter's data down, and how does `Counter` read it?

## Answer
Attributes you set on a component element become its **props**: a single
object React passes to the component.

```jsx
function Counters() {
  const [counters, setCounters] = useState([
    { id: 1, value: 4 }, { id: 2, value: 0 }, { id: 3, value: 0 },
  ]);
  return counters.map(counter => (
    <Counter key={counter.id} counter={counter} />
  ));
}

function Counter({ counter }) {        // props destructured in the parameter
  return <span className="badge">{counter.value}</span>;
}
```

- **Function components** receive props as their first argument.
- **Class components** read `this.props`, which is what the course uses.
- Passing the **whole object** (`counter={counter}`) instead of
  `value={…} id={…}` means adding a field to `counter` later doesn't require
  touching every place that renders `Counter`.

## Key points
- attributes on a component become its props object
- function components get props as an argument; classes use this.props
- destructure props: function Counter({ counter })
- passing the whole object avoids prop churn as it grows
