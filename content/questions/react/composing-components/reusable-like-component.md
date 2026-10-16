---
topic: react/composing-components
difficulty: medium
type: code
tags: [react, components, props, events, design, mosh-react]
source: mosh-react-s04
---

## Question
Design a reusable `Like` (heart) component for a movies table. What is its "interface", what does it know about movies, and who toggles and saves the like?

## Answer
Design the interface first: **inputs** (props) and **outputs** (events).

- **Input:** `liked`, a boolean saying whether to draw a full or an empty heart
- **Output:** `onClick`, raised when the heart is clicked

```jsx
// components/common/Like.jsx
export default function Like({ liked, onClick }) {
  const classes = 'fa fa-heart' + (liked ? '' : '-o');
  return <i className={classes} style={{ cursor: 'pointer' }} onClick={onClick} />;
}
```

```jsx
// in Movies
<Like liked={movie.liked} onClick={() => handleLike(movie)} />

const handleLike = (movie) =>
  setMovies(movies.map(m => (m._id === movie._id ? { ...m, liked: !m.liked } : m)));
  // later: also call the backend so the change persists
```

- `Like` knows **nothing about movies**. It's a presentational ("dumb"),
  controlled component, and reusable anywhere, so it lives in `components/common/`.
- The **consumer** owns the data: it toggles `liked` immutably and saves it.
- `onClick` on the `<i>` is the DOM event; `onClick` on `<Like>` is your
  **own** event prop that happens to share the name (`onToggle` would work
  equally well).

## Key points
- design inputs (props) and outputs (event props) first
- reusable components know nothing about the domain (movies)
- the consumer owns the data, toggles it immutably and persists it
- DOM onClick vs a custom onClick prop are different things
- reusable pieces go in components/common
