---
topic: react/getting-started
difficulty: easy
type: short-answer
tags: [react, fundamentals, mosh-react]
source: mosh-react-s01
---

## Question
What is React, and what does it actually take care of in an application?

## Answer
React is a **JavaScript library for building user interfaces** out of
**components**. Created at Facebook (used internally from 2011, open-sourced in
2013), it is the most widely used UI library, alongside Angular and Vue.

Its job is narrow: **render the view and keep it in sync with the
application's state.** You describe what the UI should look like for a given
state, and React works out which DOM updates are needed when that state
changes. You don't select elements, set their text or attach handlers through
the DOM API yourself, which is what you'd do with plain JavaScript or jQuery.

Everything else (routing, calling APIs, global state, forms) comes from other
libraries you choose, such as React Router, fetch or TanStack Query, and
Redux or Zustand.

## Key points
- a library for building UIs, not a full framework
- UIs are built from small, reusable components
- declarative: describe the UI for a state, React updates the DOM
- you don't manipulate the DOM directly
- routing, HTTP and the like come from other libraries
