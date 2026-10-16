---
topic: react/pagination-filtering-sorting
difficulty: medium
type: code
tags: [react, components, reusability, design, mosh-react]
source: mosh-react-s05
---

## Question
Build a reusable `ListGroup` for selecting a genre that isn't tied to the shape `{ _id, name }`, highlights the selected item, and tells its parent when an item is clicked.

## Answer
Pass the **names** of the properties to read, and use **bracket notation**
to read them dynamically:

```jsx
export default function ListGroup({
  items, textProperty = 'name', valueProperty = '_id', selectedItem, onItemSelect,
}) {
  return (
    <ul className="list-group">
      {items.map(item => (
        <li
          key={item[valueProperty]}
          onClick={() => onItemSelect(item)}
          className={item === selectedItem ? 'list-group-item active' : 'list-group-item'}
          style={{ cursor: 'pointer' }}
        >
          {item[textProperty]}
        </li>
      ))}
    </ul>
  );
}
```

```jsx
<ListGroup items={genres} selectedItem={selectedGenre} onItemSelect={handleGenreSelect} />
```

- `item[valueProperty]` instead of `item._id` means it works for **any**
  object shape.
- It's controlled: the parent keeps `selectedGenre` in state.
- **Consistent naming**: `selectedItem` goes with `onItemSelect`, not
  "currentItem" with "onItemSelect". Matching vocabulary means nobody has to
  guess prop names.

## Key points
- pass property names; read them with item[prop]
- defaults keep the common case simple
- selection is controlled: selectedItem in, onItemSelect out
- use consistent vocabulary in prop names
