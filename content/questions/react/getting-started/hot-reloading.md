---
topic: react/getting-started
difficulty: easy
type: flashcard
tags: [react, tooling, dev-server, mosh-react]
source: mosh-react-s01
---

## Question
In a React project's dev server, what happens when you save a file, and what is that feature called?

## Answer
The dev server rebuilds just the changed module and **swaps it into the
running page without a full reload**. This is **Hot Module Replacement
(HMR)**, also called hot reloading. React's version, **Fast Refresh** (used by
Vite and Next.js), even keeps component state across edits.

## Key points
- saving updates the running app without refreshing the page
- Hot Module Replacement; Fast Refresh keeps component state
