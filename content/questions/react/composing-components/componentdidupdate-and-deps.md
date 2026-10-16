---
topic: react/composing-components
difficulty: medium
type: code
tags: [react, lifecycle, useeffect, data-fetching, mosh-react]
source: mosh-react-s04
---

## Question
A component must re-fetch data whenever its `movieId` prop changes, but not on unrelated re-renders. Show the class version with `componentDidUpdate` and the function version with `useEffect`.

## Answer
**Class:** compare the previous props with the current ones, and only
request when the value actually changed:

```jsx
componentDidUpdate(prevProps, prevState) {
  if (prevProps.movieId !== this.props.movieId) {
    this.loadMovie(this.props.movieId);
  }
}
```

**Function:** the **dependency array** does that comparison for you. The
effect re-runs only when `movieId` changes:

```jsx
useEffect(() => {
  let ignore = false;
  getMovie(movieId).then(movie => { if (!ignore) setMovie(movie); });
  return () => { ignore = true; }; // a stale response can't overwrite a newer one
}, [movieId]);
```

Without the condition (or with a missing dependency), you'd either re-fetch
on every render or never re-fetch at all.

## Key points
- componentDidUpdate(prevProps, prevState) runs after every update
- compare previous and current values before doing expensive work
- useEffect's dependency array does the comparison
- ignore stale responses in the effect's cleanup
