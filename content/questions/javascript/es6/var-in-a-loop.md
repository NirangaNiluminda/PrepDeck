---
topic: javascript/es6
difficulty: easy
type: mcq
tags: [javascript, es6, scope, mosh-react]
source: mosh-react-s02
---

## Question
What does this log?

```js
function sayHello() {
  for (var i = 0; i < 5; i++) {}
  console.log(i);
}
sayHello();
```

## Options
- [ ] `4`
- [x] `5`
- [ ] `undefined`
- [ ] It throws `ReferenceError: i is not defined`

## Answer
**`5`.** `var` is function-scoped, so `i` still exists after the loop. It
ended at 5, the value that failed `i < 5`. Change `var` to `let` and `i`
only exists inside the loop, so the `console.log` throws
`ReferenceError: i is not defined`.

## Key points
- var leaks out of blocks into the whole function
- the loop exits when i is 5
- with let, i is block-scoped and the log throws
