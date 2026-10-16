---
topic: react/pagination-filtering-sorting
difficulty: medium
type: short-answer
tags: [react, components, design, reusability, mosh-react]
source: mosh-react-s05
---

## Question
At first the table raises `onSort('title')` with just a column path, and the `Movies` page works out whether to flip the order. Why is that the wrong place for that logic, and where should it go?

## Answer
Every page that reuses the table (customers, rentals…) would have to
**duplicate** the "same column? flip the order : start ascending" logic.
That logic is part of **how a sortable table behaves**, so it belongs inside
the table.

The course moves it step by step:
1. Into `MoviesTable` (a `raiseSort(path)` method), so the table raises
   `onSort` with the **complete next `sortColumn`** (`{ path, order }`)
   rather than just a path.
2. Then into a generic **`TableHeader`** that takes `columns`, `sortColumn`
   and `onSort`, renders the headings with the sort icon, and computes the
   next sort, so any table gets sorting for free.

The page just stores what it's given: `handleSort = (sortColumn) =>
setSortColumn(sortColumn)`. It passes the current `sortColumn` **down** too,
so the header can show the icon, and so a remembered sort order can be
restored when the user returns.

## Key points
- logic that's part of a component's behaviour belongs inside it
- otherwise every consumer duplicates it
- raise rich events ({ path, order }), not raw clicks
- generic TableHeader: columns + sortColumn in, onSort out
