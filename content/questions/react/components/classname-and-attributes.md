---
topic: react/components
difficulty: easy
type: mcq
tags: [react, jsx, attributes, mosh-react]
source: mosh-react-s03
---

## Question
Why do you write `className` instead of `class` on JSX elements, as in `<span className="badge m-2">`?

## Options
- [ ] `class` only works on `<div>` elements in React
- [x] JSX compiles to JavaScript objects, and `class` is a reserved word in JavaScript, so React uses the DOM property name `className`
- [ ] `className` lets React apply CSS faster than `class`
- [ ] `class` is reserved for class components

## Answer
JSX attributes become **props on JavaScript objects**, and `class` is a
**reserved keyword** in JavaScript. React therefore uses the DOM property
name, **`className`**. For the same reason `<label for>` becomes
**`htmlFor`**, and attributes use camelCase: `tabIndex`, `onClick`.

To set an attribute **dynamically**, replace the quotes with braces:
`<img src={imageUrl} />`. Quotes always mean a fixed string.

## Key points
- class is a JS reserved word, so JSX uses className (and htmlFor)
- quotes = static string; braces = dynamic value
- attribute names are camelCase
