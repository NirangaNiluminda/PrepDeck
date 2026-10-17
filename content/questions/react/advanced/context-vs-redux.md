---
topic: react/advanced
difficulty: medium
type: short-answer
tags: [react, context, redux, state-management, interview-favourite, mosh-react]
source: mosh-react-s11
---

## Question
Both React Context and Redux avoid prop drilling. How do they differ, and when would you reach for a state library instead of Context?

## Answer
**Redux** came first. It keeps a single global **store**; components read
from it and **dispatch actions** that **reducers** turn into new state. It
solved prop drilling, but brought a lot of **boilerplate and concepts**
(actions, reducers, middleware), which is why Mosh calls it complex.
**Redux Toolkit** has since removed much of that ceremony.

**Context** is built into React. It's a way to **pass a value down the tree**
without props. It isn't a state manager by itself: the state still lives in a
component (`useState` / `useReducer`), and Context just delivers it.

| | Context | Redux Toolkit / Zustand etc. |
|---|---|---|
| Install | built in | a library |
| What it is | a delivery mechanism | a full state container |
| Re-renders | every consumer re-renders when the value changes | components subscribe to just the slice they read |
| Tooling | React DevTools | time-travel debugging, middleware, devtools |
| Good for | rarely changing, widely needed data: current user, theme, locale | large, frequently updated, shared app state with complex update logic |

**Rule of thumb:** props for nearby components; Context for a few global,
slow-changing values; a store (Zustand, Redux Toolkit) when shared state gets
big, changes often, or needs structured update logic. **Server data** belongs
in a fetching library like TanStack Query, not in any of these.

## Key points
- both solve prop drilling
- Redux: a global store + actions/reducers; more boilerplate (less with Toolkit)
- Context delivers a value; state still lives in a component
- Context re-renders all consumers; stores let components subscribe to slices
- Context for user/theme; a store for large, fast-changing shared state
