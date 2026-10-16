---
topic: react/pagination-filtering-sorting
difficulty: easy
type: mcq
tags: [react, pagination, javascript, mosh-react]
source: mosh-react-s05
---

## Question
A `Pagination` component computes `const pagesCount = itemsCount / pageSize;` and returns `null` when `pagesCount === 1`. With 9 items and a page size of 10, it still shows a single "1" button. Why, and what's the fix?

## Options
- [ ] `itemsCount` is a string; wrap it in `Number()`
- [x] `9 / 10` is `0.9`, not `1`; use `Math.ceil(itemsCount / pageSize)` (and hide when `pagesCount <= 1`)
- [ ] `Math.floor` is needed because page numbers are integers
- [ ] The comparison should be `==` instead of `===`

## Answer
Division gives **`0.9`**, so `pagesCount === 1` is false and one page is
rendered. Round **up**: `Math.ceil(9 / 10)` is `1` (and 9 items at 4 per page
gives 3 pages, since the last page is partial). Hide pagination when
`pagesCount <= 1`, which also covers 0 items.

Build the page list without lodash:
`Array.from({ length: pagesCount }, (_, i) => i + 1)` gives `[1, 2, …]`.
`_.range(1, pagesCount + 1)`, as used in the course, excludes its end
value, hence the `+ 1`.

## Key points
- pages = Math.ceil(items / pageSize); a partial page still counts
- hide pagination when there's one page or fewer
- Array.from({ length: n }, (_, i) => i + 1) builds 1..n
