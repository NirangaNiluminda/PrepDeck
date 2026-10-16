---
topic: react/forms
difficulty: medium
type: short-answer
tags: [react, refs, dom, hooks, mosh-react]
source: mosh-react-s07
---

## Question
Why shouldn't React code use `document.getElementById('username').value`? What is a ref, how do you create and use one, and when is it actually appropriate?

## Answer
React's job is to **abstract the DOM**: you describe UI from state, and React
owns the DOM nodes. Reaching around it with `document.getElementById` couples
your component to the page, breaks when IDs repeat, and makes testing harder.

When you genuinely need the DOM node, use a **ref**:

```jsx
import { useEffect, useRef } from 'react';

function LoginForm() {
  const usernameRef = useRef(null);            // class components: React.createRef()

  useEffect(() => { usernameRef.current.focus(); }, []); // ref.current is the DOM node

  return <input ref={usernameRef} id="username" />;
}
```

**Use refs sparingly**, for things state can't express:
- managing **focus**, text selection, or scrolling into view
- **animations**, and measuring element size or position
- integrating **third-party DOM libraries** such as charts, maps or editors

Don't use refs to read form values: use **controlled inputs**. Often there's
no need for a ref at all. Focus on load, for example, is just the
**`autoFocus`** attribute (camelCase in JSX).

`useRef` also stores any mutable value that should survive re-renders
**without** causing one, like a timer id.

## Key points
- don't query the DOM directly; React owns it
- refs: useRef(null) / createRef(); attach with ref={…}; read ref.current
- use them for focus, measuring, animations, third-party DOM libraries
- not for form values: use controlled inputs; autoFocus may suffice
- useRef also holds mutable values without triggering re-renders
