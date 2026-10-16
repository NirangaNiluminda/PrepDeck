---
topic: react/pagination-filtering-sorting
difficulty: medium
type: mcq
tags: [react, components, render-props, jsx, mosh-react]
source: mosh-react-s05
---

## Question
In a table's column config, why is the Delete column written as `content: movie => <button onClick={() => onDelete(movie)}>Delete</button>` rather than `content: <button onClick={() => onDelete(movie)}>Delete</button>`?

## Options
- [ ] JSX elements can't be stored in plain objects
- [ ] Functions render faster than elements
- [x] The button needs the specific row's movie, which isn't known when the columns are defined; a function receives it when each row renders
- [ ] React requires column definitions to be functions

## Answer
**It needs that row's data.** When the columns array is defined there's no
`movie` in scope, so the element version fails with "movie is not defined".
Elements *can* be stored in objects; the course even shows `const x =
<h1/>`. But a single element would be the same for every row. A **function
from item to JSX** lets `TableBody` call `column.content(item)` once per
row. That's the *render prop / render function* pattern.

## Key points
- JSX elements are plain values and can be stored anywhere
- per-row content needs the row's item, so use a function
- TableBody calls column.content(item) for each row
