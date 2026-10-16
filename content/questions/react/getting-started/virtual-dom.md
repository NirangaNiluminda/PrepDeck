---
topic: react/getting-started
difficulty: medium
type: short-answer
tags: [react, virtual-dom, rendering, interview-favourite, mosh-react]
source: mosh-react-s01
---

## Question
What is the virtual DOM, and how does React use it to update the page when state changes?

## Answer
The **virtual DOM** is React's lightweight, in-memory description of the UI: a
tree of plain JavaScript objects (React elements), not real browser DOM nodes.
Those objects are cheap to create and compare, while touching the real DOM is
comparatively expensive.

When state changes:

1. React re-renders the affected components, producing a **new element tree**.
2. It **compares** that tree with the previous one. This step is called
   **reconciliation** or "diffing".
3. It applies only the **minimal set of changes** to the real DOM, batching them.

So you write code as if the whole UI were redrawn on every change, and React
makes it efficient. That is also why the library is called *React*: it
reacts to state changes by updating the DOM.

## Key points
- an in-memory tree of plain JS objects describing the UI
- on state change: re-render, diff against the previous tree, patch the real DOM
- the diffing step is called reconciliation
- only the parts that changed are updated
- you never update the DOM yourself

## Explanation
Two things interviewers like to hear. First, the benefit is a **declarative**
programming model with reasonable performance; the virtual DOM isn't
automatically faster than carefully hand-written DOM code. Second, in lists,
**`key`** props tell reconciliation which item is which, so it can move items
instead of re-creating them.
