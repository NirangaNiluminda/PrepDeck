---
topic: react/components
difficulty: easy
type: mcq
tags: [react, events, mosh-react]
source: mosh-react-s03
---

## Question
Which correctly runs `handleIncrement` when the button is clicked?

## Options
- [ ] `<button onclick={handleIncrement}>`
- [ ] `<button onClick={handleIncrement()}>`
- [x] `<button onClick={handleIncrement}>`
- [ ] `<button onClick="handleIncrement()">`

## Answer
**`onClick={handleIncrement}`**: the event name in **camelCase**, given a
**reference** to the function.

- `onclick` (lowercase) isn't a React prop.
- `handleIncrement()` **calls** the function during render and passes its
  return value as the handler. That's a common bug, and with a state update
  inside, it loops forever.
- A string handler is HTML style; React needs a function.

Handlers are named `handleSomething` by convention, and every DOM event
has a prop: `onDoubleClick`, `onChange`, `onKeyDown`, `onSubmit`…

## Key points
- camelCase event props: onClick, onChange, onKeyDown
- pass a function reference, don't call it
- calling it in JSX runs it on every render
