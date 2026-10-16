---
topic: react/pagination-filtering-sorting
difficulty: medium
type: code
tags: [react, sorting, state, mosh-react]
source: mosh-react-s05
---

## Question
Clicking a column heading should sort by that column, ascending; clicking the same heading again flips the order. Columns include the nested `genre.name`. Implement the sort state and the toggle.

## Answer
Keep a **`sortColumn` object** in state: what to sort by, and in which
direction.

```jsx
const [sortColumn, setSortColumn] = useState({ path: 'title', order: 'asc' });

function nextSort(current, path) {
  if (current.path === path)
    return { path, order: current.order === 'asc' ? 'desc' : 'asc' };
  return { path, order: 'asc' };       // a new column always starts ascending
}

<th onClick={() => setSortColumn(nextSort(sortColumn, 'genre.name'))}>Genre</th>
```

Sorting happens **during render**, after filtering and before pagination.
Lodash handles nested paths:

```js
import orderBy from 'lodash/orderBy';
const sorted = orderBy(filtered, [sortColumn.path], [sortColumn.order]);
```

Without lodash, read the nested value with
`path.split('.').reduce((obj, key) => obj?.[key], item)`, then sort a copy
(`[...filtered].sort(...)`, or `toSorted`). Never sort the state array in
place.

## Key points
- state: sortColumn = { path, order }
- same column flips the order; a new column starts ascending
- sort during render: filter, then sort, then paginate
- nested paths: lodash orderBy, or a reduce-based getter
- sort a copy, never the state array in place
