---
topic: react/advanced
difficulty: medium
type: mcq
tags: [react, hooks, rules-of-hooks, interview-favourite, mosh-react]
source: mosh-react-s11
---

## Question
Which of these breaks the rules of hooks?

## Options
- [ ] Calling `useState` twice at the top of a component, for `count` and `name`
- [ ] Calling `useEffect` inside a custom hook named `useDocumentTitle`
- [x] `if (user) { const [cart, setCart] = useState([]); }`
- [ ] Calling a custom hook at the top level of a component

## Answer
**Calling a hook inside a condition.** The two rules:
1. **Call hooks only at the top level**: never inside conditions, loops, or
   nested functions, and never after an early `return`.
2. **Call hooks only from function components or custom hooks**, not from
   regular functions or classes.

React reports it as: *"React Hook "useState" is called conditionally. React
Hooks must be called in the exact same order in every component render."*

**Why:** React doesn't identify hooks by name. It keeps each component's
hook state in a **list, in call order**: the first `useState` call gets slot
1, the second slot 2, and so on, on every render. If a hook is called on one render
but skipped on the next, every later hook reads the wrong slot. Put the
condition **inside** the hook or in the JSX instead. The
`eslint-plugin-react-hooks` lint rule catches violations.

## Key points
- hooks only at the top level, never in conditions or loops
- only in components or custom hooks
- React tracks hooks by call order, so order must be stable
- the eslint react-hooks plugin enforces this
