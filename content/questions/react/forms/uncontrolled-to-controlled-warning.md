---
topic: react/forms
difficulty: medium
type: mcq
tags: [react, forms, controlled-components, bugs, mosh-react]
source: mosh-react-s07
---

## Question
State starts as `{ password: '' }` (no `username` key), and the field is `<input value={data.username} onChange={handleChange} />`. On the first keystroke React warns: *"A component is changing an uncontrolled input to be controlled."* Why?

## Options
- [ ] `onChange` should be `onInput`
- [x] `data.username` is `undefined` at first, and `value={undefined}` makes the input uncontrolled; after one keystroke it gets a string and becomes controlled
- [ ] Inputs can't be controlled if they're inside a `<form>`
- [ ] The input is missing a `key`

## Answer
React treats `value={undefined}` (or `null`) as **"no value given"**, so the
input starts **uncontrolled** and keeps its own state. The first keystroke
sets `username` to `'a'`, so the input switches to **controlled**, and React
warns because an input shouldn't change modes. With `value={null}` you get a
different warning, telling you to use an empty string.

**Fix:** initialise **every** form field in state, to `''` or to the value
loaded from the server. The same rule applies whenever you reset a
controlled input: reset to `''`, never to `null`. That's why the course's
search box clears its query to `''`.

## Key points
- value undefined or null means uncontrolled
- switching to a string later triggers the warning
- initialise every field ('' or the server value)
- reset controlled inputs to '', never null
