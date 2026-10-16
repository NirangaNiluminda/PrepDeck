---
topic: react/composing-components
difficulty: medium
type: mcq
tags: [react, lifecycle, data-fetching, useeffect, mosh-react]
source: mosh-react-s04
---

## Question
A component needs to load its list of movies from the server when it first appears. Where should the request go?

## Options
- [ ] Directly in the component body or `render()`, before the `return`
- [ ] In the class `constructor`, followed by `this.setState`
- [x] In `componentDidMount`, or `useEffect(() => { … }, [])` in a function component
- [ ] In `componentWillUnmount`

## Answer
**After mount**: `componentDidMount`, or an effect with an empty dependency
array. Both run once the component is on the screen; when the data arrives,
you put it in state.

- In render or the function body, the request would fire on **every render**,
  and setting state from it would loop.
- The **constructor** is only for initialising, where you assign `this.state`
  directly. Calling `this.setState` there is an error because the component
  isn't mounted yet.
- `componentWillUnmount` is for cleanup.

**Today**, many apps let a data library (TanStack Query, SWR) or the
framework (Next.js server components, route loaders) do the fetching rather
than hand-written effects. The "not in render" rule still holds.

## Key points
- fetch after mount: componentDidMount / useEffect(fn, [])
- never in render: it re-runs and can loop
- constructor: initialise only; no setState
- data libraries or framework loaders often replace manual effects
