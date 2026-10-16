---
topic: react/components
difficulty: medium
type: short-answer
tags: [react, state, hooks, interview-favourite, mosh-react]
source: mosh-react-s03
---

## Question
Why doesn't `count++` (or `this.state.count++` in a class) update the screen? How do you update state correctly, and how does this differ from Angular?

## Answer
React **doesn't watch your variables**. Mutating state directly changes the
value in memory, but React is never told, so it never re-renders. You must
update state **through React**:

```jsx
const [count, setCount] = useState(0);
setCount(count + 1);              // function component

this.setState({ count: this.state.count + 1 }); // class component (course)
```

The setter tells React the state changed. React schedules a re-render,
compares the new output with the previous one, and updates only the DOM
that changed.

**Angular**, by contrast, detects changes automatically: its zone.js patches
browser events and timers, then runs change detection. React makes you say
explicitly what changed.

Two details:
- the class `setState` **merges** the object you pass into the existing state;
  a `useState` setter **replaces** that piece of state
- never mutate objects or arrays in state; build new ones
  (`[...items, x]`, `{ ...user, name }`)

## Key points
- React doesn't detect direct mutation; nothing re-renders
- update via the setter from useState (setState in classes)
- the update schedules a re-render plus a DOM diff
- Angular auto-detects changes; React needs an explicit update
- setState merges; useState setters replace; never mutate
