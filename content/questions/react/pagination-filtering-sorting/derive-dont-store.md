---
topic: react/pagination-filtering-sorting
difficulty: medium
type: short-answer
tags: [react, state, derived-state, interview-favourite, mosh-react]
source: mosh-react-s05
---

## Question
The movies page supports a genre filter, sorting and pagination. What should be stored in state, what should be computed during render, and in what order should filtering, sorting and pagination run?

## Answer
**State holds only the source data plus the user's choices:**
```js
movies          // the full, original list, never trimmed
selectedGenre
sortColumn      // { path: 'title', order: 'asc' }
currentPage
pageSize
```

**Everything shown is derived from those on each render.** Don't keep
`filteredMovies` or `pagedMovies` in state; they'd have to be kept in sync
by hand.

```js
const filtered = selectedGenre?._id
  ? movies.filter(m => m.genre._id === selectedGenre._id)
  : movies;
const sorted = orderBy(filtered, [sortColumn.path], [sortColumn.order]);
const pageItems = paginate(sorted, currentPage, pageSize);
// then render pageItems, and give Pagination itemsCount = filtered.length
```

The order is **filter → sort → paginate**: pagination must count the
*filtered* items, and a page must be a slice of the *sorted* list. The
course moves this into a helper (`getPagedData()` returning
`{ totalCount, data }`) to keep the render code short. With hooks you can
wrap it in `useMemo` if the list is large.

## Key points
- store source data and user choices, not derived lists
- compute filtered, sorted and paged data during render
- order: filter, then sort, then paginate
- page count and the "N movies" message use filtered.length
- extract the logic into a helper, and use useMemo if it's expensive
