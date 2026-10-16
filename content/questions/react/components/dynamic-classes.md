---
topic: react/components
difficulty: easy
type: code
tags: [react, jsx, styling, mosh-react]
source: mosh-react-s03
---

## Question
A badge should be yellow (`badge-warning`) when the count is 0 and blue (`badge-primary`) otherwise, and it always needs `badge m-2`. Implement this cleanly.

## Answer
Compute the class string in a small, well-named helper, so the JSX stays
readable:

```jsx
function getBadgeClasses(count) {
  let classes = 'badge m-2 badge-';
  classes += count === 0 ? 'warning' : 'primary';
  return classes;
}

<span className={getBadgeClasses(count)}>{count}</span>
```

or with a template literal:
`` className={`badge m-2 badge-${count === 0 ? 'warning' : 'primary'}`} ``.

Pulling the logic out of the JSX, as the course does with an "extract
method" refactor, stops the render code from filling up with styling
details. In real projects the tiny **`clsx`** library does this:
`clsx('badge m-2', count === 0 ? 'badge-warning' : 'badge-primary')`.

## Key points
- className takes any expression, so compute the string
- extract the logic into a descriptively named helper
- let, because the string is built up step by step
- template literals or clsx keep it tidy
