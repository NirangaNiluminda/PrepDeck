---
topic: javascript/es6
difficulty: easy
type: short-answer
tags: [javascript, es6, objects, mosh-react]
source: mosh-react-s02
---

## Question
When do you use dot notation (`person.name`) versus bracket notation (`person['name']`) to access an object's members? And what's the ES6 shorthand for defining a method in an object literal?

## Answer
- **Dot notation** when you know the member's name while writing the code:
  `person.name = 'Mary'`.
- **Bracket notation** when the name is only known **at run time**, e.g. it
  comes from a variable or user input: `person[fieldName] = value`. It also
  works for names that aren't valid identifiers, like `obj['first-name']`.

ES6 method shorthand drops the colon and the `function` keyword:

```js
const person = {
  name: 'Mosh',
  walk: function () {},  // old style
  talk() {},              // ES6 shorthand
};
```

Brackets also work *inside* a literal, as computed property names. React
forms use this all the time: `setValues({ ...values, [e.target.name]: e.target.value })`.

## Key points
- dot notation for names known in advance
- bracket notation for dynamic names (variables, input) or odd characters
- method shorthand: talk() {} instead of talk: function () {}
- computed keys [expr]: value inside object literals
