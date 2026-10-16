---
topic: react/forms
difficulty: medium
type: short-answer
tags: [react, forms, validation, ux, mosh-react]
source: mosh-react-s07
---

## Question
How should validation behave when the form is submitted versus while the user types in one field? Should a field show all of its errors at once?

## Answer
**On submit, validate the whole form** and show every invalid field. Then
stop if anything failed, so the server is never called:

```js
const handleSubmit = (e) => {
  e.preventDefault();
  const errors = validate(data);      // returns {} or { field: message }
  setErrors(errors);
  if (Object.keys(errors).length) return;
  doSubmit();
};
```

**On change, validate only that field.** Update its entry in the errors
object, or delete it when it's now valid, so the user isn't shown errors for
fields they haven't reached yet:

```js
const handleChange = ({ currentTarget: input }) => {
  const nextErrors = { ...errors };
  const message = validateProperty(input);
  if (message) nextErrors[input.name] = message;
  else delete nextErrors[input.name];
  setErrors(nextErrors);
  setData({ ...data, [input.name]: input.value });
};
```

**One message per field at a time.** Listing "required, at least 3
characters, must contain a dot…" all at once feels like the form is
shouting at the user. So field validation **aborts at the first failure**,
while whole-form validation collects **every field's** error (in Joi:
`abortEarly: false`).

You can also disable the submit button while the form is invalid,
`disabled={Object.keys(validate(data)).length > 0}`, so it lights up only
when everything passes. Some UIs prefer to validate on **blur** instead, so
errors don't flash mid-typing.

## Key points
- submit: validate everything, show all errors, stop if invalid
- change: validate only that field; add or clear its error
- one message per field (abort early); all fields on submit
- optionally disable submit while invalid, or validate on blur
