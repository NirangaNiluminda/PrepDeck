---
topic: react/composing-components
difficulty: medium
type: code
tags: [react, props, children, composition, mosh-react]
source: mosh-react-s04
---

## Question
What is the `children` prop? Build a `Dialog` component that renders whatever content its caller puts between its tags, and explain when you'd use `children` instead of a regular prop.

## Answer
Whatever you place **between a component's opening and closing tags** is
passed to it as **`props.children`**: a React element, or an array of them,
or text.

```jsx
function Dialog({ title, children }) {
  return (
    <div className="dialog">
      <h2>{title}</h2>
      <div className="dialog-body">{children}</div>
    </div>
  );
}

<Dialog title="Delete movie?">
  <p>This can't be undone.</p>
  <button>Delete</button>
</Dialog>
```

Use **`children`** when the component is a **container or wrapper** that
shouldn't care what goes inside it: dialogs, cards, layouts, providers. For
a plain value like a title or an id, a normal prop is simpler.

## Key points
- content between the tags arrives as props.children
- children can be elements, text or arrays
- ideal for wrappers: dialogs, cards, layouts
- plain values are better as ordinary props
