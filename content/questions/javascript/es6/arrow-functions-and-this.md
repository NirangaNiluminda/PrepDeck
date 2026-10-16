---
topic: javascript/es6
difficulty: medium
type: short-answer
tags: [javascript, this, functions, interview-favourite, mosh-react]
source: mosh-react-s02
---

## Question
Inside a method, a callback passed to `setTimeout` logs `this` and gets `window` (or `undefined`) instead of the object. Why? How did developers fix it before ES6, and how do arrow functions fix it?

## Answer
```js
const person = {
  talk() {
    setTimeout(function () {
      console.log(this); // window, not person
    }, 1000);
  },
};
```

The callback is a **standalone function** called later by `setTimeout`, not
as a method of `person`, so it gets the default `this`.

**Before ES6** you saved `this` in a variable the callback could close over:
`const self = this;` (or `that`), then used `self` inside.

**Arrow functions don't have their own `this`.** They use the `this` of the
code around them (*lexical* `this`), so the fix is just:

```js
setTimeout(() => console.log(this), 1000); // person
```

The flip side: don't use an arrow function as an object *method* whose `this`
you need. `{ talk: () => this }` takes `this` from the outer scope, not from
the object.

## Key points
- a plain callback is called standalone, so it gets the default this
- old fix: const self = this, then use self in the callback
- arrow functions inherit this from where they're defined (lexical this)
- don't use arrows as object methods that need this
