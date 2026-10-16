---
topic: react/advanced
difficulty: hard
type: short-answer
tags: [react, context, performance, usememo, mosh-react]
source: mosh-react-s11
---

## Question
The app provides both a `UserContext` and a `CartContext`. How do you provide and consume several contexts, and what performance pitfall does writing `value={{ currentUser, onLoggedIn }}` inline introduce?

## Answer
**Nest the providers.** Order only matters if one context reads another.
**Read each one separately**:

```jsx
<CartContext.Provider value={cartValue}>
  <UserContext.Provider value={userValue}>
    <MoviePage />
  </UserContext.Provider>
</CartContext.Provider>

function MovieRow() {
  const user = useContext(UserContext);
  const cart = useContext(CartContext);
  /* … */
}
```

(Class components would need nested `<X.Consumer>` render functions, which
is clumsy; `useContext` is a big part of why hooks won.)

**Pitfall: a new value object on every render.** `value={{ currentUser,
onLoggedIn }}` creates a **new object each time the provider renders**, so
**every consumer re-renders**, even when nothing in it changed. Memoise the
value:

```jsx
const userValue = useMemo(
  () => ({ currentUser, onLoggedIn: handleLoggedIn }),
  [currentUser],   // wrap handleLoggedIn in useCallback if it isn't stable
);
```

**Split contexts by how often they change** (user vs cart vs theme), so an
update to one doesn't re-render consumers of the others. For large,
frequently changing global state, a store such as **Zustand** or **Redux
Toolkit** offers more control over what re-renders.

## Key points
- nest providers; consume each with its own useContext
- an inline value object is new every render, so all consumers re-render
- memoise the value with useMemo (and useCallback for functions)
- split contexts by update frequency
- frequently changing global state: consider a store (Zustand, Redux Toolkit)
