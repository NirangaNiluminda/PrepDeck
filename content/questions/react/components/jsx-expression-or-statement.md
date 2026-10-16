---
topic: react/components
difficulty: easy
type: mcq
tags: [react, jsx, mosh-react]
source: mosh-react-s03
---

## Question
Which of these is valid inside a JSX element's `{ }`?

## Options
- [ ] `{ if (count === 0) 'Zero' }`
- [ ] `{ for (const tag of tags) <li>{tag}</li> }`
- [x] `{ count === 0 ? 'Zero' : count }`
- [ ] `{ let label = 'Zero' }`

## Answer
**The ternary.** JSX braces take **expressions** (things that produce a
value), and a ternary is one. `if`, `for` and `let` are **statements**, so
they're syntax errors there. JSX isn't a templating language with its own
loops and ifs: it compiles to function calls, so you use plain JavaScript
expressions, such as `map` for lists and `?:` or `&&` for conditions, or put
the `if` before the `return`.

## Key points
- only expressions inside JSX braces
- ternary or && for conditions, map for lists
- if/for go before the return or in a helper function
