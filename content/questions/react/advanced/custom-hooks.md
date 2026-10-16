---
topic: react/advanced
difficulty: medium
type: code
tags: [react, hooks, custom-hooks, reusability, mosh-react]
source: mosh-react-s11
---

## Question
Several components need to keep the browser tab's title in sync with some value. Extract that into a custom hook `useDocumentTitle`. What makes something a custom hook, and do two components using it share state?

## Answer
```js
// hooks/useDocumentTitle.js
import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);              // re-run only when the title changes
}
```

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  useDocumentTitle(`${name} has clicked ${count} times!`);
  /* … */
}
```

- A **custom hook** is just a function whose name **starts with `use`** and
  that **calls other hooks**. The `use` prefix lets React and the lint rules
  apply the rules of hooks to it.
- It reuses **logic, not state**. Every component that calls it gets its
  **own** state and effects. To share actual data, use Context or lift state up.
- This is what replaced most HOCs and render props: no wrapper components,
  no prop collisions, and the data flow is visible at the call site.

The course's version omits the dependency array, so it re-runs after every
render. That's harmless here, but `[title]` says exactly when it should run.

## Key points
- a custom hook = a use-prefixed function that calls hooks
- extracts reusable logic out of components
- each caller gets its own independent state
- replaced most HOC/render-prop patterns
- give effects a precise dependency array
