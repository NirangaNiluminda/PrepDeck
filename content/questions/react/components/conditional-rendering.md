---
topic: react/components
difficulty: medium
type: short-answer
tags: [react, jsx, conditional-rendering, mosh-react]
source: mosh-react-s03
---

## Question
JSX has no `if`/`else`. What are the ways to render something conditionally? Show "There are no tags" when the list is empty, and the list otherwise.

## Answer
JSX isn't a templating engine (unlike Angular's `*ngIf`), so you use plain
JavaScript:

**1. `if` before the `return`, or in a helper**, best for whole different
outputs:
```jsx
function Tags({ tags }) {
  if (tags.length === 0) return <p>There are no tags.</p>;
  return <ul>{tags.map(t => <li key={t}>{t}</li>)}</ul>;
}
```

**2. Ternary `cond ? a : b`**, inline either/or:
`{tags.length === 0 ? <p>No tags</p> : <TagList tags={tags} />}`

**3. Logical `&&`**, inline "only if", with no else branch:
`{tags.length === 0 && <p>Please create a new tag.</p>}`

**4. `return null`** to render nothing at all.

`&&` works because JavaScript returns the **last evaluated operand**: when
the left side is falsy you get that falsy value, otherwise you get the
element on the right.

## Key points
- if/else before the return (or in a helper) for whole branches
- ternary for inline either/or
- && for inline only-if
- return null to render nothing
- && returns the right operand when the left one is truthy
