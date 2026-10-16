---
topic: react/forms
difficulty: medium
type: code
tags: [react, forms, search, components, mosh-react]
source: mosh-react-s07
---

## Question
Add a case-insensitive title search box to the movies page. Searching should clear the selected genre, choosing a genre should clear the search, and both should send the user back to page 1. How do you structure the `SearchBox` component and the handlers?

## Answer
A **controlled** `SearchBox` with a **simpler interface** than a raw input:
it raises `onChange` with the **query string**, not an event object.

```jsx
function SearchBox({ value, onChange }) {
  return (
    <input type="search" className="form-control my-3" placeholder="Search…"
           value={value} onChange={e => onChange(e.currentTarget.value)} />
  );
}
```

```jsx
const handleSearch = (query) => {
  setSearchQuery(query);
  setSelectedGenre(null);   // search and genre filters don't combine
  setCurrentPage(1);        // otherwise you may land on a page past the results
};

const handleGenreSelect = (genre) => {
  setSelectedGenre(genre);
  setSearchQuery('');       // '' not null: the input is controlled
  setCurrentPage(1);
};

// derived during render
const q = searchQuery.toLowerCase();
const filtered = searchQuery
  ? movies.filter(m => m.title.toLowerCase().includes(q))
  : selectedGenre?._id
    ? movies.filter(m => m.genre._id === selectedGenre._id)
    : movies;
```

- Wrapping the input means every handler gets a plain string, with no
  `e.currentTarget.value` repeated everywhere.
- Lowercase **both** sides for a case-insensitive match. (The course uses
  `startsWith`; `includes` matches anywhere in the title.)
- Initialise **every** filter in state (`searchQuery: ''`, `selectedGenre:
  null`), so the next developer can see all the page's parameters.

## Key points
- SearchBox: controlled, raises onChange(query string)
- search and genre filters reset each other; both reset to page 1
- clear the query to '' (controlled input), never null
- case-insensitive: lowercase both sides
