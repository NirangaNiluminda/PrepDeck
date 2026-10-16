---
topic: react/getting-started
difficulty: medium
type: short-answer
tags: [react, angular, trade-offs, mosh-react]
source: mosh-react-s01
---

## Question
React and Angular are both component-based. What is the key difference between them, and what are the trade-offs?

## Answer
**Angular is a framework**: a complete solution that ships its own router,
HTTP client, forms, dependency injection and project structure. **React is a
library**: it only renders the view and keeps it in sync with state.

| | React | Angular |
|---|---|---|
| Scope | the view layer only | everything an app needs |
| Routing, HTTP, forms | pick libraries yourself | built in |
| API to learn | small | large |
| Flexibility | high: choose your own stack | lower: one opinionated way |

**Trade-off.** React's small surface is quick to learn and lets you choose
the libraries you prefer, but you have to make, and keep making, those choices.
Angular decides for you, which gives consistency across a team, at the cost of
a bigger learning curve and less freedom. Today, meta-frameworks such as
**Next.js** sit on top of React and supply the framework parts (routing, data
loading, rendering on the server).

## Key points
- Angular is a full framework, React is a library
- React handles only rendering and keeping the view in sync with state
- React needs other libraries for routing, HTTP and the like
- small API and flexibility, versus Angular's consistency and built-ins
- Next.js adds the framework parts on top of React
