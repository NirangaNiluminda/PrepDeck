---
topic: react/composing-components
difficulty: easy
type: mcq
tags: [react, jsx, attributes, mosh-react]
source: mosh-react-s04
---

## Question
A Decrement button must be disabled while the counter's value is 0. What's the idiomatic JSX?

## Options
- [ ] `<button disabled>` and remove it in an effect when the value changes
- [ ] `<button disabled="false">` when enabled
- [x] `<button disabled={counter.value === 0}>`
- [ ] `<button {counter.value === 0 && 'disabled'}>`

## Answer
**`disabled={counter.value === 0}`.** Pass a **boolean** to boolean
attributes: React adds `disabled` when it's `true` and leaves it out when
it's `false`. Watch out for `disabled="false"`: it's a non-empty string, so
it's truthy and the button is disabled. The course's version,
`disabled={value === 0 ? 'disabled' : ''}`, works only because an empty
string is falsy, but the boolean form says what it means. The last option
isn't valid JSX.

## Key points
- boolean attributes take booleans: disabled={condition}
- the string "false" is truthy, so the button stays disabled
- no effects or DOM manipulation needed
