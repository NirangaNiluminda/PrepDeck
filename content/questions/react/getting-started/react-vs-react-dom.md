---
topic: react/getting-started
difficulty: medium
type: short-answer
tags: [react, react-dom, architecture, mosh-react]
source: mosh-react-s01
---

## Question
Why is React split into two packages, `react` and `react-dom`? What does each one do?

## Answer
- **`react`** is the core: components, elements, hooks and reconciliation (working
  out *what* the UI should be and what changed). It knows nothing about browsers.
- **`react-dom`** is a **renderer**: it takes that result and applies it to the
  **browser DOM**, through `createRoot(...).render()`, plus server rendering
  via `react-dom/server`.

Keeping the core separate from the renderer lets the same React target other
platforms through other renderers: **React Native** for iOS/Android views,
`react-three-fiber` for 3D scenes, Ink for terminals.

## Key points
- react: components, hooks and reconciliation, platform-independent
- react-dom: renders to the browser DOM (and server HTML)
- separating them allows other renderers, e.g. React Native
