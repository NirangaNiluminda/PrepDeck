---
topic: react/pagination-filtering-sorting
difficulty: medium
type: short-answer
tags: [react, components, design, reusability, mosh-react]
source: mosh-react-s05
---

## Question
You're about to build a reusable `Pagination` component. How do you decide its interface before writing it, and what should that interface be?

## Answer
A component's **interface** is its **inputs (props)** and the **events it
raises (callback props)**. The best way to find it is to **use the component
before implementing it**: write the JSX where it will be consumed, and see
what you naturally need to pass.

```jsx
<Pagination
  itemsCount={filtered.length}   // inputs: enough to work out the pages
  pageSize={pageSize}
  currentPage={currentPage}      // so it can highlight, and restore, the page
  onPageChange={handlePageChange} // event: tells the parent a page was chosen
/>
```

Design rules:
- **Decoupled from the domain:** it knows nothing about movies, only counts
  and pages, so it can live in `components/common/`.
- **Controlled:** it keeps no state of its own. The parent owns `currentPage`
  in state and updates it in `handlePageChange`.
- **Small interface:** the fewer props, the easier it is to use. Think of a
  remote control with 5 buttons versus one with 50.

## Key points
- interface = inputs (props) + events (callback props)
- write the consuming JSX first to discover it
- reusable components know nothing about the domain
- keep the component controlled; the parent owns the state
- keep the interface small
