---
topic: javascript/es6
difficulty: medium
type: mcq
tags: [javascript, this, interview-favourite, mosh-react]
source: mosh-react-s02
---

## Question
In strict mode (the default in ES modules, and so in React projects), what does the last line log?

```js
const person = {
  name: 'Mosh',
  walk() { console.log(this); },
};

const walk = person.walk;
walk();
```

## Options
- [ ] the `person` object
- [ ] the global `window` object
- [x] `undefined`
- [ ] an empty object `{}`

## Answer
**`undefined`.** In JavaScript, `this` isn't fixed when a function is
defined: it's decided by **how the function is called**.

- `person.walk()` is called *as a method*, so `this` is `person`.
- `walk()` is called as a plain function, with nothing before the dot. In
  **strict mode** `this` is then `undefined`; in sloppy mode it would be the
  global object (`window` in browsers).

That's why passing a method around, for example as an event handler, can
"lose" its `this`. Fixes: `bind`, or an arrow function.

## Key points
- this depends on how a function is called, not where it's defined
- obj.method() gives this = obj
- a plain call gives undefined in strict mode, window otherwise
- detached methods (callbacks, handlers) lose their this
