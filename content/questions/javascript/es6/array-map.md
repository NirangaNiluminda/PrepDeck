---
topic: javascript/es6
difficulty: easy
type: short-answer
tags: [javascript, arrays, react, mosh-react]
source: mosh-react-s02
---

## Question
What does `Array.prototype.map` do, does it change the original array, and why is it so important in React?

## Answer
`map` calls a function on **each element** and collects the return values
into a **new array** of the same length. **The original array is not
modified.**

```js
const colors = ['red', 'green', 'blue'];
const items = colors.map(color => `<li>${color}</li>`);
// ['<li>red</li>', '<li>green</li>', '<li>blue</li>']
```

In React, `map` is **how you render lists**: you transform an array of data
into an array of elements.

```jsx
<ul>
  {colors.map(color => <li key={color}>{color}</li>)}
</ul>
```

Each item needs a stable, unique **`key`** (usually an id) so React can tell
items apart when the list changes.

## Key points
- map transforms each element and returns a new array
- it never mutates the original
- React renders lists by mapping data to elements
- every list item needs a stable, unique key
