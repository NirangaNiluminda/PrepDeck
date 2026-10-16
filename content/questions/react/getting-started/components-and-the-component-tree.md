---
topic: react/getting-started
difficulty: easy
type: short-answer
tags: [react, components, fundamentals, mosh-react]
source: mosh-react-s01
---

## Question
What is a component in React, and what does it mean that a React app is a "tree of components"? Illustrate with a page like Twitter's.

## Answer
A **component** is an independent, reusable piece of the UI: it owns how one
part of the screen looks and behaves. You build components in isolation and
**compose** them into bigger ones.

Every app has one **root component** (usually `App`) that contains all the
others, so the whole UI forms a **tree**. A Twitter-like page might be:

```
App
├── Navbar
├── Profile
├── Trends
└── Feed
    └── Tweet (one per tweet)
        └── Like
```

`Like` is small and self-contained, so it can be reused anywhere: on other
pages, or in another app.

A component takes data in (props and its own state) and returns a
description of its UI. **Today** that's a function returning JSX, with state
held by hooks such as `useState`. Older code, including courses from around
2018, used ES6 classes extending `React.Component` with a `state` object and a
`render()` method; you'll still meet them in existing codebases.

## Key points
- a component is an isolated, reusable piece of UI
- components compose: big UIs are built from small ones
- one root component (App) and child components form a tree
- function components with hooks today; classes with render() in older code
