---
topic: react/composing-components
difficulty: medium
type: mcq
tags: [react, rendering, performance, virtual-dom, mosh-react]
source: mosh-react-s04
---

## Question
`App` holds the counters state. Clicking one counter's increment button updates that state, and `App`, `Navbar`, `Counters` and every `Counter` re-render. What happens to the real DOM?

## Options
- [ ] The whole page's DOM is rebuilt, because every component re-rendered
- [ ] All counters' DOM nodes are replaced
- [x] Only the DOM nodes whose output changed are updated, e.g. that one counter's `<span>` and the navbar badge
- [ ] Nothing, until the page is reloaded

## Answer
**Only what changed.** "Re-render" means React called the components again
and got a **new virtual DOM**. It then diffs that against the previous one
and patches just the differences, here that counter's badge and the navbar
total. In the course's demo, the browser's Elements panel highlights only
that `<span>`.

That's also **why state must be updated immutably**: React needs the old and
new values as separate objects to compare.

Re-rendering is usually cheap. If a subtree is genuinely expensive,
`React.memo` (or `useMemo`) can skip re-rendering it when its props haven't
changed.

## Key points
- a parent's render re-runs its children recursively
- re-render produces a new virtual DOM; it isn't a DOM rebuild
- React diffs and patches only the changed nodes
- immutability gives React old and new values to compare
- React.memo skips re-renders of expensive subtrees
