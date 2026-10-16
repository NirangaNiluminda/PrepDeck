---
topic: react/composing-components
difficulty: medium
type: flashcard
tags: [react, props, state, mosh-react]
source: mosh-react-s04
---

## Question
What is a "controlled component" in the sense of parent and child components?

## Answer
A component with **no local state** for the data it shows. It receives that
data through **props** and **raises events** (calls callback props) whenever
it should change, so it is **entirely controlled by its parent**. Examples
are `Counter` with `counter` / `onIncrement` / `onDelete`, or a `Like` with
`liked` / `onClick`. Form inputs use the same idea: `value` + `onChange`.

## Key points
- no state of its own; data in via props, changes out via events
- the parent owns and changes the data
