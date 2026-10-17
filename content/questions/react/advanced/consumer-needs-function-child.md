---
topic: react/advanced
difficulty: easy
type: mcq
tags: [react, context, class-components, mosh-react]
source: mosh-react-s11
---

## Question
A class component renders:

```jsx
<UserContext.Consumer>
  <div>Movie List</div>
</UserContext.Consumer>
```

What happens?

## Options
- [ ] It renders "Movie List" and ignores the context
- [ ] It renders nothing, silently
- [x] It throws "render is not a function": `Consumer` expects a function as its child, which receives the context value
- [ ] It works, and `this.props.value` holds the context

## Answer
**It throws.** `<Context.Consumer>` uses the *render function as a child*
pattern: React calls the child with the current context value and renders
whatever it returns:

```jsx
<UserContext.Consumer>
  {userContext => <div>Movie List {userContext.currentUser?.name}</div>}
</UserContext.Consumer>
```

That function-in-JSX shape is one reason `useContext` in function
components reads much more cleanly.

## Key points
- Consumer's child must be a function: value => JSX
- an element child throws "render is not a function"
- useContext avoids the pattern entirely
