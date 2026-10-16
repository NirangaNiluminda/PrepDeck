---
topic: react/pagination-filtering-sorting
difficulty: easy
type: code
tags: [react, pagination, javascript, mosh-react]
source: mosh-react-s05
---

## Question
Write a pure `paginate(items, pageNumber, pageSize)` utility that returns the items for one page (pages start at 1). Where should it live, and when is client-side pagination the wrong choice?

## Answer
```js
// src/utils/paginate.js
export function paginate(items, pageNumber, pageSize) {
  const startIndex = (pageNumber - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}
```

Page 2 with a size of 4 gives `startIndex` 4, so items 4–7. `slice` never
mutates and copes with a partial last page. The course chains lodash
(`_(items).slice(start).take(pageSize).value()`), but plain `slice` does the
same thing.

Put algorithms like this in **`src/utils/`**, not in the component. That
keeps rendering code small, and the function is reusable and easy to test.

**Client-side** pagination needs **every item downloaded** first, which is
fine for a few hundred rows. For large or growing data, paginate **on the
server** (`GET /movies?page=2&pageSize=4`, or cursor-based) and send only
one page, along with the total count.

## Key points
- startIndex = (page - 1) * pageSize; slice(start, start + pageSize)
- a pure function in utils/, not in the component
- client-side paging means loading all the data first
- large data sets: paginate on the server and return a total count
