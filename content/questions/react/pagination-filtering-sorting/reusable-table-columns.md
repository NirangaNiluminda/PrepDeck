---
topic: react/pagination-filtering-sorting
difficulty: hard
type: code
tags: [react, components, reusability, render-props, mosh-react]
source: mosh-react-s05
---

## Question
Design a reusable `Table` driven by a `columns` array. Most cells just show a property, which may be nested like `genre.name`, but some must render custom content, such as a Like component or a Delete button for that row. How does `TableBody` render each cell, and what are the keys?

## Answer
Each column describes **how to get its cell**:

```jsx
const columns = [
  { path: 'title', label: 'Title' },
  { path: 'genre.name', label: 'Genre' },
  { path: 'numberInStock', label: 'Stock' },
  { key: 'like', content: movie => <Like liked={movie.liked} onClick={() => onLike(movie)} /> },
  { key: 'delete', content: movie => <button onClick={() => onDelete(movie)}>Delete</button> },
];

<Table columns={columns} data={movies} sortColumn={sortColumn} onSort={onSort} />
```

```jsx
function TableBody({ data, columns }) {
  const renderCell = (item, column) =>
    column.content ? column.content(item) : get(item, column.path); // lodash get handles 'genre.name'

  return (
    <tbody>
      {data.map(item => (
        <tr key={item._id}>
          {columns.map(column => (
            <td key={item._id + (column.path || column.key)}>{renderCell(item, column)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
```

- `content` is a **function from the row's item to JSX**, a *render
  function*. It can't be a fixed element, because the like/delete button
  needs **that row's movie**, which only exists while `TableBody` maps over
  the data.
- Rows are keyed by the item id; cells by id + column path (or the column's
  own `key` when it has no path). Header cells use `column.path || column.key`.
- `Table` just composes `TableHeader` and `TableBody`. `MoviesTable`
  becomes a thin wrapper that defines the movie columns, so a customers
  table is just a different `columns` array.

## Key points
- columns array: { path, label } or { key, content: item => JSX }
- content is a render function because it needs the row's item
- nested paths via lodash get (or a reduce helper)
- keys: row = item id; cell = id + path or key
- domain wrappers just define the columns
