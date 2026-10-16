---
topic: react/components
difficulty: medium
type: mcq
tags: [react, jsx, conditional-rendering, interview-favourite, mosh-react]
source: mosh-react-s03
---

## Question
`messages` is an empty array. What does this render?

```jsx
<div>{messages.length && <p>You have {messages.length} messages</p>}</div>
```

## Options
- [ ] Nothing: an empty `<div>`
- [x] A `0` inside the `<div>`
- [ ] `false` as text
- [ ] It throws, because a number can't be a child

## Answer
**It renders `0`.** `&&` returns its **first falsy operand**, or the last
operand if all are truthy. `messages.length` is `0`, which is falsy, so the
whole expression evaluates to `0`, and React **renders numbers** (it skips
only `false`, `null`, `undefined` and `true`).

Make the left side a real boolean:
`{messages.length > 0 && <p>…</p>}`, or use a ternary.

The underlying rule is the same one the course shows in the console:
`true && 'Hi'` gives `'Hi'`, `true && 'Hi' && 1` gives `1`, and `0 && x`
gives `0`.

## Key points
- && returns the first falsy operand, or the last one
- 0 is falsy but React renders it as text
- use a boolean condition: length > 0 && …
- React skips false, null, undefined and true
