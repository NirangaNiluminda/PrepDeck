---
topic: javascript/es6
difficulty: easy
type: code
tags: [javascript, es6, destructuring, react, mosh-react]
source: mosh-react-s02
---

## Question
Using destructuring, pull `street`, `city` and `country` out of an `address` object into constants, then show how to take just one property and how to rename one. Where is this used constantly in React?

## Answer
```js
const address = { street: '1 Main St', city: 'Colombo', country: 'Sri Lanka' };

// instead of three lines of address.street, address.city, address.country
const { street, city, country } = address;

// only what you need
const { city } = address;

// rename: create a constant st from address.street
const { street: st } = address;

// default value if the property is missing
const { zip = '00000' } = address;
```

Destructuring removes the repeated `address.` and makes clear which fields
the code uses.

In React it's everywhere:
- **props:** `function Like({ liked, onToggle }) { … }`
- **hooks:** `const [count, setCount] = useState(0);`. That's *array*
  destructuring, which works by position rather than name.

## Key points
- const { a, b } = obj extracts properties by name
- list only the properties you need
- rename with { street: st }; defaults with { zip = '00000' }
- React: destructure props in the parameter list; [value, setValue] from useState
