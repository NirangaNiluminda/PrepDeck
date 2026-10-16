---
topic: react/components
difficulty: easy
type: short-answer
tags: [react, jsx, styling, mosh-react]
source: mosh-react-s03
---

## Question
How do you set inline styles on a JSX element? Why the double curly braces, and when should you use inline styles at all?

## Answer
`style` takes a **JavaScript object**, not a CSS string. CSS property names
become **camelCase**, and plain numbers get `px` added automatically for
size properties:

```jsx
const styles = { fontSize: 10, fontWeight: 'bold' }; // fontSize: 10 means 10px
<span style={styles}>…</span>

// or inline: the outer braces are JSX, the inner braces are the object literal
<span style={{ fontSize: 30 }}>…</span>
```

**Prefer CSS classes** (`className`) for nearly everything: they're easier
to maintain, reusable, and cheaper to render. Inline styles suit one-off or
truly dynamic values, like a progress bar's `width: \`${percent}%\``.

## Key points
- style takes an object, not a string
- camelCase property names; numbers become px
- {{ }}: JSX braces around an object literal
- prefer classes; inline styles only for one-off or computed values
