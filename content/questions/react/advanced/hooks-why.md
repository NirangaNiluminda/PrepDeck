---
topic: react/advanced
difficulty: medium
type: short-answer
tags: [react, hooks, interview-favourite, mosh-react]
source: mosh-react-s11
---

## Question
What are hooks, which React version introduced them, and what problems did they solve?

## Answer
**Hooks** (React **16.8**, February 2019) are functions such as `useState`,
`useEffect` and `useContext` that let **function components** use state,
side effects, context and other React features that used to be class-only.

They solved three problems:
1. **Classes were awkward.** `this`, binding event handlers, constructors and
   `super(props)` were all boilerplate, and a constant source of bugs.
2. **Related logic was split across lifecycle methods.** Subscribe in
   `componentDidMount`, update in `componentDidUpdate`, unsubscribe in
   `componentWillUnmount`. One `useEffect` keeps the setup and its cleanup
   together.
3. **Reusing stateful logic needed wrappers.** HOCs and render props created
   "wrapper hell" and prop-name collisions. **Custom hooks** share logic as
   plain function calls, with no extra components in the tree.

Hooks are now the standard way to write React. Classes still work, but new
features are built for hooks.

## Key points
- hooks = state/effects/context in function components (React 16.8)
- no this, no binding, no class boilerplate
- an effect keeps setup and cleanup together instead of split across lifecycles
- custom hooks reuse logic without HOCs or render props
