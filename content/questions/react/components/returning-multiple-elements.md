---
topic: react/components
difficulty: easy
type: mcq
tags: [react, jsx, fragments, mosh-react]
source: mosh-react-s03
---

## Question
A component returns a `<p>` followed by a `<table>` side by side, and fails to compile. What's the cleanest fix that adds no extra element to the DOM?

## Options
- [ ] Return them as an array without keys: `[<p/>, <table/>]`
- [ ] Wrap them in a `<div>`
- [x] Wrap them in a Fragment: `<>…</>` (or `<React.Fragment>`)
- [ ] Split them into two `return` statements

## Answer
**A Fragment.** A component must return **one** root element, because JSX
compiles to a single function call. A `<div>` works too, but it adds a
wrapper element to the DOM, which can break layouts and table or list
markup. `<>…</>` groups children **without rendering anything itself**. Use
the long form `<React.Fragment key={…}>` when you need a `key`, e.g. inside
`map`.

## Key points
- a component returns a single root
- a Fragment groups children without an extra DOM node
- <>…</> shorthand; <Fragment key> when a key is needed
