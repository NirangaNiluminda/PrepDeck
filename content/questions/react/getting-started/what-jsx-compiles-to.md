---
topic: react/getting-started
difficulty: easy
type: mcq
tags: [react, jsx, babel, mosh-react]
source: mosh-react-s01
---

## Question
With the classic JSX transform, what does `const element = <h1>Hello World</h1>;` compile into?

## Options
- [ ] `const element = "<h1>Hello World</h1>";`
- [x] `const element = React.createElement('h1', null, 'Hello World');`
- [ ] `const element = document.createElement('h1');`
- [ ] `const element = ReactDOM.render('h1', 'Hello World');`

## Answer
**`React.createElement('h1', null, 'Hello World')`**: the type, the props
(none, so `null`) and the children. It returns a React element, a plain object
describing the `<h1>`, not a string and not a real DOM node. Only
`ReactDOM` later turns elements into actual DOM.

## Key points
- JSX compiles to function calls, never to strings
- createElement(type, props, ...children)
- the result is a React element (an object), not a DOM node
