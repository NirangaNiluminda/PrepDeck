---
topic: react/advanced
difficulty: medium
type: code
tags: [react, context, hooks, class-components, mosh-react]
source: mosh-react-s11
---

## Question
Show the three ways to read a context value: in a function component, and the two ways in a class component.

## Answer
**Function component: `useContext`** (the normal way today)
```jsx
import { useContext } from 'react';

function MovieRow() {
  const { currentUser } = useContext(UserContext);
  return <div>Movie Row {currentUser?.name}</div>;
}
```

**Class component, option 1: `static contextType`.** Then read `this.context`
anywhere, including lifecycle methods:
```jsx
class MovieList extends Component {
  static contextType = UserContext;
  componentDidMount() { console.log('context', this.context); }
  render() { return <div>{this.context.currentUser?.name}</div>; }
}
```
This only allows **one** context per class. Equivalently, assign it after
the class: `MovieList.contextType = UserContext;`.

**Class component, option 2: `<Context.Consumer>` with a render function.**
Works inside `render`, with any number of contexts. Its child **must be a
function** that receives the value. A plain element child fails with
*"render is not a function"*:
```jsx
<UserContext.Consumer>
  {userContext => <div>Movie List {userContext.currentUser?.name}</div>}
</UserContext.Consumer>
```

When the Provider's `value` changes, **every component that reads that
context re-renders**. `useContext` also keeps the component tree cleaner: a
`Consumer` adds an extra node to the tree in React DevTools, and a hook
doesn't.

## Key points
- function components: const value = useContext(Ctx)
- classes: static contextType = Ctx, then this.context (one context only)
- classes: <Ctx.Consumer>{value => …}</Ctx.Consumer> render function
- consumers re-render when the provided value changes
