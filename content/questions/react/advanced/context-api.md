---
topic: react/advanced
difficulty: medium
type: short-answer
tags: [react, context, state, prop-drilling, interview-favourite, mosh-react]
source: mosh-react-s11
---

## Question
What problem does React Context solve? Show how to create a context for the current user and provide it to the app.

## Answer
**Prop drilling**: data needed deep in the tree (the current user, a theme,
the language, the cart) has to be passed as props through every intermediate
component, even ones that don't use it. In the course's example, `App` →
`MoviePage` → `MovieList` → `MovieRow` all just pass the user along.

Before Context became practical, **Redux** was the usual answer: one global
**store** that any component can read from, at the cost of considerable
boilerplate and complexity. **Context** is React's built-in solution. A
component **provides** a value, and **any descendant reads it directly**:

```jsx
// context/userContext.js
import { createContext } from 'react';
const UserContext = createContext(null);   // default for when there's no Provider above
UserContext.displayName = 'UserContext';   // its label in React DevTools
export default UserContext;
```

```jsx
// App
<UserContext.Provider value={{ currentUser, onLoggedIn: handleLoggedIn }}>
  <MoviePage />
  <Login />
</UserContext.Provider>
```

(React 19 also allows `<UserContext value={…}>` without `.Provider`.)

Every component under the Provider can now read `currentUser`, and
`MoviePage` no longer needs to know about users at all.

Use Context for **widely needed, rarely changing** data. Plain props are
still the clearest choice for passing data one or two levels down.

## Key points
- solves prop drilling for data needed deep in the tree
- createContext(default); <Ctx.Provider value={…}> wraps the subtree
- any descendant can read the value directly
- displayName labels it in React DevTools
- use it for widely shared data; props for nearby children
