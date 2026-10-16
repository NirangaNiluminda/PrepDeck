---
topic: react/forms
difficulty: medium
type: short-answer
tags: [react, components, design, trade-offs, mosh-react]
source: mosh-react-s07
---

## Question
`Input` and a new `Select` component share the same wrapper, label and error markup. Should you merge them into one component that switches on a `type` prop?

## Answer
Probably not. Here a little duplication beats a component full of
conditionals.

The course keeps them **separate**. Checkboxes, radio buttons and selects
don't fit the same structure as a text input: a select has `options` and an
empty first `<option>`; checkboxes put the label after the control; radio
groups have several inputs. One "does everything" component would fill up
with `if type === …` branches and become harder to read than two clear
components.

Software design is about **trade-offs**: accept some duplication when it
keeps each piece simple. If the shared part grows, extract only *that*,
e.g. a `FormField` wrapper rendering the label and error around any
`children`, rather than forcing every control into one component.

```jsx
function FormField({ name, label, error, children }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}
```

## Key points
- different controls have genuinely different structures
- a single type-switching component turns into a tangle of ifs
- some duplication is acceptable when it keeps the code clear
- extract only the truly shared part (a FormField wrapper with children)
