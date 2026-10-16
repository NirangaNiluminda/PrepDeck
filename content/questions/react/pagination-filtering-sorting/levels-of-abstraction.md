---
topic: react/pagination-filtering-sorting
difficulty: medium
type: short-answer
tags: [react, components, clean-code, refactoring, mosh-react]
source: mosh-react-s05
---

## Question
The `Movies` page renders `<ListGroup>` and `<Pagination>` next to fifty lines of raw `<table><thead><tr><th>…` markup. What's wrong with that, and how do you fix it?

## Answer
It **mixes levels of abstraction**: high-level components (`ListGroup`,
`Pagination`) sit beside low-level elements and row-by-row details. The page
is hard to scan, and its intent ("filters, a table, paging") gets lost in
markup.

**Extract a component** for the detailed part, so everything at that level
reads the same:

```jsx
<div className="row">
  <div className="col-3">
    <ListGroup items={genres} selectedItem={selectedGenre} onItemSelect={handleGenreSelect} />
  </div>
  <div className="col">
    <p>Showing {totalCount} movies in the database.</p>
    <MoviesTable movies={movies} sortColumn={sortColumn}
                 onLike={handleLike} onDelete={handleDelete} onSort={handleSort} />
    <Pagination itemsCount={totalCount} pageSize={pageSize}
                currentPage={currentPage} onPageChange={handlePageChange} />
  </div>
</div>
```

`MoviesTable` stays in `components/`, not `common/`, because it's specific to
movies. It receives data and **raises events** (`onLike`, `onDelete`,
`onSort`); `Movies` still owns the state. Applied repeatedly, the same
refactoring later yields reusable `Table`, `TableHeader` and `TableBody`
components.

## Key points
- don't mix high-level components with low-level markup in one place
- extract components so a component reads at one level
- the extracted piece raises events; the owner keeps the state
- domain-specific components in components/; generic ones in common/
