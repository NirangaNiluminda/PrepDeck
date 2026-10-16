---
topic: react/composing-components
difficulty: medium
type: short-answer
tags: [react, lifecycle, hooks, useeffect, interview-favourite, mosh-react]
source: mosh-react-s04
---

## Question
Name the three phases of a component's lifecycle and the main class lifecycle methods in each. What's the `useEffect` equivalent of each?

## Answer
| Phase | When | Class methods (in order) | Function component |
|---|---|---|---|
| **Mounting** | created and inserted into the DOM | `constructor` → `render` → `componentDidMount` | `useEffect(fn, [])` runs once after the first render |
| **Updating** | props or state changed | `render` → `componentDidUpdate(prevProps, prevState)` | `useEffect(fn, [deps])` runs after renders where a dependency changed |
| **Unmounting** | about to be removed from the DOM | `componentWillUnmount` | the **cleanup function** returned from the effect |

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);   // "did mount"
  return () => clearInterval(id);       // "will unmount"
}, []);
```

Rendering is recursive: when a component renders, its children render too.
And `render` always runs **before** the "did" methods, because those fire
after React has updated the real DOM.

Note: an effect isn't a one-to-one copy of a lifecycle method. It's better
thought of as "keep this side effect in sync with these values", which is
why its dependency array matters.

## Key points
- mount: constructor, render, componentDidMount, i.e. useEffect with []
- update: render, componentDidUpdate, i.e. useEffect with [deps]
- unmount: componentWillUnmount, i.e. the effect's cleanup function
- the "did" methods and effects run after the DOM is updated
