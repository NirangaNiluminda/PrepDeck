---
topic: javascript/es6
difficulty: medium
type: short-answer
tags: [javascript, es6, spread, immutability, react, mosh-react]
source: mosh-react-s02
---

## Question
What does the spread operator (`...`) do with arrays and with objects? Why is it central to updating state in React, and what's its main limitation?

## Answer
Spread **expands** an array's items, or an object's properties, into a new
array or object.

```js
const combined = [...first, 'a', ...second, 'b']; // clearer than first.concat(...)
const copy = [...first];                           // clone an array

const merged = { ...base, ...extra, location: 'Australia' }; // later keys win
const clone = { ...base };                                    // clone an object
```

It beats `concat` and `Object.assign` because you can **see the shape of the
result**, and insert extra items or properties anywhere.

**React** state must be updated **immutably**: you create a new object or
array instead of changing the existing one, so React notices the change.
Spread is the everyday tool for that:

```js
setTodos([...todos, newTodo]);
setUser({ ...user, name: 'Mary' });
```

**Limitation: it's a shallow copy.** Nested objects and arrays are still
shared, so `{ ...user }` copies `user.address` by reference. Spread at each
level you change, or use `structuredClone` for a deep copy.

## Key points
- spreads array items or object properties into a new array/object
- combine, insert, clone; for objects, later properties override earlier ones
- React state updates: new copies via spread, never mutation
- shallow: nested objects are shared, not copied
