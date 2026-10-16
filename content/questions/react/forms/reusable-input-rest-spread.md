---
topic: react/forms
difficulty: medium
type: code
tags: [react, forms, components, javascript, mosh-react]
source: mosh-react-s07
---

## Question
Every field repeats the same markup: a wrapper div, a `<label htmlFor>` matching the input's `id`, the input, and an error message. Extract a reusable `Input` that passes any other attribute (type, value, onChange, placeholder…) straight through.

## Answer
Destructure the props the component itself uses, and collect **everything
else** with the **rest** operator, then **spread** it onto the `<input>`:

```jsx
export default function Input({ name, label, error, ...rest }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input {...rest} id={name} name={name} className="form-control" />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}

<Input name="password" label="Password" type="password"
       value={data.password} onChange={handleChange} error={errors.password} />
```

- `...rest` means a new attribute (say `autoComplete`) needs **no change** to
  `Input`.
- **Pitfall:** `name` is destructured out, so it's **not** in `rest`. Set
  `name={name}` explicitly, or the input has no name and a name-based
  `handleChange` breaks. The course hits exactly this bug.
- `htmlFor` (not `for`) links the label to the input by id, so clicking the
  label focuses the field.
- `Input` shows only its own field's error, via `error &&`.

## Key points
- destructure what the component uses; ...rest collects the remainder
- spread {...rest} onto the input to pass everything through
- re-add anything you destructured out (name) explicitly
- label htmlFor = input id
- the component owns how its error is displayed
