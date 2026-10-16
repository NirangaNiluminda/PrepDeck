---
topic: react/forms
difficulty: easy
type: flashcard
tags: [react, forms, validation, mosh-react]
source: mosh-react-s07
---

## Question
How should a form keep its validation errors in state, and why that shape?

## Answer
As an **object keyed by field name**, e.g. `{ username: 'Username is required.' }`,
and **always an object**: `{}` when there are no errors, **never `null`**.
Lookup is direct (`errors.username`, or `errors[name]` in a generic helper)
instead of `errors.find(e => e.name === 'username')` on an array. Keeping it
an object means `errors.username` can never throw "cannot read property of null".

## Key points
- errors = { [fieldName]: message }
- {} when valid, never null
