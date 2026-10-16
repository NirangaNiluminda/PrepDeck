---
topic: react/components
difficulty: medium
type: short-answer
tags: [react, lists, keys, rendering, interview-favourite, mosh-react]
source: mosh-react-s03
---

## Question
How do you render a list in React, and why does React warn "Each child in a list should have a unique key prop"? What makes a good key?

## Answer
JSX has no loop syntax, so you **`map`** the array to elements:

```jsx
<ul>
  {tags.map(tag => <li key={tag}>{tag}</li>)}
</ul>
```

React needs a **`key`** on each item to **identify it across renders**.
When the list changes, the key tells reconciliation which item is which, so
React can update, move or remove exactly the right DOM nodes instead of
guessing by position.

A good key is:
- **stable and unique among its siblings**, usually the item's **id**, e.g.
  `key={movie._id}`. It only has to be unique within that list, not the
  whole page.
- **not the array index** if the list can be reordered, filtered or added to
  at the front. Index keys then attach the wrong state, such as input text
  or animations, to the wrong item.
- **not random** (`Math.random()`), which gives a new key every render and
  remounts everything.

## Key points
- render lists with array.map(item => <Element key=… />)
- keys let React match items between renders
- use a stable id; unique among siblings only
- avoid index keys for lists that reorder; never random keys
