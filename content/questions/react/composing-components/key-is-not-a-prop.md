---
topic: react/composing-components
difficulty: easy
type: mcq
tags: [react, props, keys, mosh-react]
source: mosh-react-s04
---

## Question
A parent renders `<Counter key={counter.id} value={counter.value} />`. Inside `Counter`, what is `props.key`?

## Options
- [ ] `counter.id`
- [x] `undefined`; `key` is used by React itself and isn't passed to the component
- [ ] `null`
- [ ] The array index of that counter

## Answer
**`undefined`.** `key` (like `ref`) is a **special attribute** that React
consumes for reconciliation, so it never reaches the component's props. If
the child needs the id, pass it separately (`id={counter.id}`) or pass the
whole object. That's why code often seems to repeat the same value as
`key` and `id`.

## Key points
- key is reserved for React's list reconciliation
- it isn't available on props
- pass the id as its own prop if the child needs it
