---
topic: react/pagination-filtering-sorting
difficulty: easy
type: code
tags: [react, props, defaults, mosh-react]
source: mosh-react-s05
---

## Question
A generic `ListGroup` takes `textProperty` and `valueProperty`, but almost every caller passes `"name"` and `"_id"`. How do you make those props optional with sensible defaults?

## Answer
**Today**, use **default values in the destructured parameters**:

```jsx
function ListGroup({
  items,
  textProperty = 'name',
  valueProperty = '_id',
  selectedItem,
  onItemSelect,
}) {
  /* … */
}
```

Callers then write just `<ListGroup items={genres} … />`, and override only
for unusual data: `textProperty="label"`.

**Course version:** `ListGroup.defaultProps = { textProperty: 'name',
valueProperty: '_id' }`. That's spelled `defaultProps`, with a lowercase d.
**`defaultProps` is deprecated for function components and was removed for
them in React 19**, so use parameter defaults. Classes still support it.

Fewer required props make a component easier to use, like a remote control
with fewer buttons.

## Key points
- default the props in the destructured parameter list
- callers override only when their data differs
- defaultProps is legacy: removed for function components in React 19
- fewer required props make a simpler interface
