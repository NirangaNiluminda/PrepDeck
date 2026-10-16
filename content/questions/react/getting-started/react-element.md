---
topic: react/getting-started
difficulty: medium
type: mcq
tags: [react, elements, virtual-dom, mosh-react]
source: mosh-react-s01
---

## Question
You run `console.log(<h1>Hello World</h1>)` in a React app. What shows up in the console?

## Options
- [ ] An `HTMLHeadingElement`, the real DOM node
- [ ] The string `"<h1>Hello World</h1>"`
- [x] A plain JavaScript object with a `type` of `'h1'` and `props` holding the children
- [ ] `undefined`, because JSX only produces output inside `render`

## Answer
A **React element**: a plain, immutable JavaScript object, roughly
`{ type: 'h1', props: { children: 'Hello World' }, key: null, … }`. It
**describes** a DOM node but isn't one. Elements are the building blocks of the
virtual DOM: when state changes, React creates new elements, diffs them
against the previous ones, and updates the real DOM to match.

## Key points
- JSX evaluates to a React element, a plain object
- it has a type and props (children are inside props)
- it describes a DOM node; it is not a DOM node
- elements make up the virtual DOM
