---
topic: react/components
difficulty: easy
type: code
tags: [react, events, mosh-react]
source: mosh-react-s03
---

## Question
In a list of products, each row has an Increment button whose handler needs that row's product: `handleIncrement(product)`. How do you pass the argument, given that `onClick` needs a function reference?

## Answer
Wrap the call in an **inline arrow function**. The arrow is the reference
React calls on click, and inside it you call your handler with whatever you
like:

```jsx
{products.map(product => (
  <button key={product.id} onClick={() => handleIncrement(product)}>
    Increment
  </button>
))}
```

`onClick={handleIncrement(product)}` would call it immediately during
render. The course first shows a separate wrapper method (`doHandleIncrement`)
and then replaces it with this inline arrow, which needs no extra method.

## Key points
- onClick needs a function, so wrap the call: () => handler(arg)
- inside map, pass the current item
- no need for a separate wrapper method
