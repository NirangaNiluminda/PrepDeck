---
topic: react/composing-components
difficulty: easy
type: flashcard
tags: [react, debugging, tooling, mosh-react]
source: mosh-react-s04
---

## Question
What does the React Developer Tools browser extension give you for debugging?

## Answer
A **Components** tab showing the **component tree**. Select a component to
see and edit its **props, state and hooks**, and use search to find it in big
trees. The selected component is available in the console as **`$r`**, just
as the Elements panel exposes the selected DOM node as **`$0`**. A
**Profiler** tab shows which components rendered and how long they took.

## Key points
- inspect the tree and each component's props, state and hooks
- $r = selected component in the console; $0 = selected DOM node
- Profiler for render performance
