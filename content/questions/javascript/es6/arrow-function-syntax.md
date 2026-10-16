---
topic: javascript/es6
difficulty: easy
type: short-answer
tags: [javascript, es6, functions, mosh-react]
source: mosh-react-s02
---

## Question
Rewrite `const square = function (number) { return number * number; }` as an arrow function, as short as possible, and explain each simplification. Where do arrow functions pay off most?

## Answer
```js
const square = number => number * number;
```

1. Drop `function` and put `=>` between the parameters and the body.
2. With **exactly one parameter**, the parentheses are optional. With none
   or with several, they're required: `() => …`, `(a, b) => …`.
3. If the body is a **single expression**, drop the braces and `return`: the
   value is returned implicitly.

They shine as **short callbacks**, e.g.
`const active = jobs.filter(job => job.isActive)`. That reads almost like
English, "filter the jobs where the job is active", with no `function`/`return`
noise. In React you'll see them everywhere: `items.map(item => <li>…</li>)`
and `onClick={() => setOpen(true)}`.

Gotcha: to return an object literal implicitly, wrap it in parentheses,
`() => ({ id: 1 })`. Otherwise the braces are read as the function body.

## Key points
- param => expression; parentheses optional for exactly one parameter
- a single-expression body returns implicitly, with no braces or return
- ideal for callbacks: filter, map, event handlers
- return an object implicitly with () => ({ ... })
