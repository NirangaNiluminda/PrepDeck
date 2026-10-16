---
topic: javascript/es6
difficulty: medium
type: short-answer
tags: [javascript, es6, scope, interview-favourite, mosh-react]
source: mosh-react-s02
---

## Question
What's the difference between `var`, `let` and `const`? Which should you use by default?

## Answer
| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | the whole **function** | the **block** `{ … }` | the **block** |
| Reassign | yes | yes | **no** |
| Before its declaration | `undefined` (hoisted) | ReferenceError (temporal dead zone) | ReferenceError |

`var` ignores blocks: a `var i` declared in a `for` loop is still readable
after the loop, which surprises people coming from other languages. `let` and
`const`, added in ES6 (2015), are scoped to the block they're declared in.

**Default to `const`, use `let` only when you must reassign, and avoid
`var`.** One catch: `const` stops *reassignment*, not mutation, so
`const user = {}` can still have `user.name = 'x'` set on it.

## Key points
- var is function-scoped; let and const are block-scoped
- const can't be reassigned, but objects it points to can still change
- let/const throw if used before declaration (temporal dead zone)
- prefer const, then let; avoid var
