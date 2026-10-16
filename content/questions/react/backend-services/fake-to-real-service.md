---
topic: react/backend-services
difficulty: medium
type: short-answer
tags: [react, architecture, refactoring, services, mosh-react]
source: mosh-react-s08
---

## Question
The app was built against an in-memory `fakeMovieService` (`getMovies()` returns an array). How do you switch it to the real backend with minimal risk?

## Answer
**Refactor step by step**, not as one big-bang change, and keep the
**interface**:

1. Create `genreService.js` exporting the **same function names**
   (`getGenres`), implemented with `http.get` instead of an array.
2. Change only the import in the component, from `fakeGenreService` to
   `genreService`, and add `await` (plus `async`) where it's called:
   `const { data: genres } = await getGenres();`.
3. Test it, then do the same for movies (`getMovies`, `getMovie`, `deleteMovie`,
   `saveMovie`), one function at a time, and delete the fake services at the end.

The more of the interface you keep, the less else changes. Here the only
difference was async: the fake returned arrays, the real one returns promises.
If the fake had **returned promises from the start**, swapping would have been
a one-line import change.

That's the general **ports and adapters** idea: code against an interface,
swap the implementation (in-memory for tests and early development, HTTP or a
database for real use), and the callers don't notice.

## Key points
- keep the same interface (function names and shapes); swap the implementation
- refactor one service and one function at a time, testing each step
- returning promises from fakes makes the switch a pure import change
- ports and adapters: callers depend on the interface, not the backend
