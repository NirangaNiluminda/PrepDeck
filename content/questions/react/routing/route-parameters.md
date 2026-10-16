---
topic: react/routing
difficulty: easy
type: code
tags: [react, routing, react-router, mosh-react]
source: mosh-react-s06
---

## Question
Each movie title in a table should link to `/movies/<id>`, and that page should show the id from the URL. Define the route, the link, and read the parameter.

## Answer
```jsx
// route: a colon marks a parameter
<Route path="/movies/:id" element={<MovieForm />} />

// link: in the table's title column (content is a function of the row)
{ path: 'title', label: 'Title',
  content: movie => <Link to={`/movies/${movie._id}`}>{movie.title}</Link> }

// read it
import { useParams } from 'react-router-dom';

function MovieForm() {
  const { id } = useParams();     // v4: props.match.params.id
  return <h1>Movie Form {id}</h1>;
}
```

- A route can have several parameters, e.g. `/posts/:year/:month`.
- **Parameter values are always strings.** Convert them with `Number(id)`
  when you need a number.
- Use `<Link>` (not `<a>`) for the title, or each click reloads the whole app.

## Key points
- define params with :name in the path
- read them with useParams() (v4: match.params)
- values are strings; convert when needed
- link with a template literal: to={`/movies/${id}`}
