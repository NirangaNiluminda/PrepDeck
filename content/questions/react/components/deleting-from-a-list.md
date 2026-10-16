---
topic: react/components
difficulty: medium
type: code
tags: [react, state, lists, immutability, mosh-react]
source: mosh-react-s03
---

## Question
A movies table has a Delete button on each row. Implement `handleDelete(movie)` so the row disappears, and show a "Showing N movies" or "There are no movies in the database" message.

## Answer
Never remove the item from the existing array. **Build a new array** without
it with `filter`, and set that as the new state:

```jsx
import { useState } from 'react';
import { getMovies } from '../services/fakeMovieService';

export default function Movies() {
  const [movies, setMovies] = useState(getMovies);

  const handleDelete = (movie) =>
    setMovies(movies.filter(m => m._id !== movie._id));

  const count = movies.length;
  if (count === 0) return <p>There are no movies in the database.</p>;

  return (
    <>
      <p>Showing {count} movies in the database.</p>
      <table className="table">
        <tbody>
          {movies.map(movie => (
            <tr key={movie._id}>
              <td>{movie.title}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(movie)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
```

- `filter` returns a new array, which is the immutable update React needs
- `key={movie._id}`: each row needs a stable id
- `() => handleDelete(movie)` passes the row's movie
- `<>…</>` (a Fragment) groups the message and the table without an extra `div`

**Course vs today.** The class version calls
`this.setState({ movies })`, using the ES6 shorthand for `{ movies: movies }`.

## Key points
- filter out the item to get a new array, then set it as state
- never splice or mutate the array in state
- key rows by id; pass the row's item to the handler
- show a different message when the list is empty
