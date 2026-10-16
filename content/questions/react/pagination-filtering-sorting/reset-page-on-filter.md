---
topic: react/pagination-filtering-sorting
difficulty: medium
type: mcq
tags: [react, pagination, state, bugs, mosh-react]
source: mosh-react-s05
---

## Question
The user is on page 2 of "All genres" and then selects "Comedy", which has only 3 movies (one page). The header says "Showing 3 movies", but the table is empty. What's the bug?

## Options
- [ ] The filter compares genre names instead of ids
- [x] `currentPage` is still 2, and page 2 of a 3-item list is empty; reset `currentPage` to 1 whenever the filter changes
- [ ] The movies need a new `key` when the filter changes
- [ ] `setState` is asynchronous, so the filter hasn't applied yet

## Answer
The page number survived the filter change, so the code shows **page 2 of
the new list**, which doesn't exist. Whenever the **result set changes**
(new filter, new search), **go back to page 1**:

```js
const handleGenreSelect = (genre) => {
  setSelectedGenre(genre);
  setCurrentPage(1);
};
```

A related detail from the same video: the "All genres" entry is a
pseudo-item with no real id (`{ _id: '', name: 'All genres' }`). Filter only
when `selectedGenre?._id` is set, and give it an `_id` of `''` so its list
`key` isn't `undefined`.

## Key points
- a changed result set plus an old page number gives an empty page
- reset currentPage to 1 when the filter or search changes
- "All" pseudo-item: filter only when it has a real id
