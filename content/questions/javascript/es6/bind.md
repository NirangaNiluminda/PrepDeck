---
topic: javascript/es6
difficulty: medium
type: short-answer
tags: [javascript, this, functions, mosh-react]
source: mosh-react-s02
---

## Question
What does `fn.bind(obj)` do, and why did older React code call `this.handleClick = this.handleClick.bind(this)`?

## Answer
Functions are objects in JavaScript, and they come with methods. **`bind`**
returns a **new function** whose `this` is permanently set to the argument
you pass, however that new function is later called.

```js
const walk = person.walk.bind(person);
walk(); // this === person, even though it's called on its own
```

Class components passed methods as event handlers (`onClick={this.handleClick}`).
React calls them as plain functions, so `this` was `undefined` inside. Binding
in the constructor fixed that. The usual alternative was a class field with an
arrow function, `handleClick = () => { … }`.

**Today**, function components don't use `this` at all; handlers are just
functions that close over props and state. `bind` still matters for plain
JavaScript and older code.

Related methods: `call(obj, ...args)` and `apply(obj, argsArray)` *invoke*
the function right away with that `this`, whereas `bind` returns a new
function for later.

## Key points
- bind returns a new function with this fixed to the argument
- used to keep this when a method is passed as a callback
- old React: bind handlers in the constructor, or use arrow class fields
- call and apply invoke immediately; bind returns a function
