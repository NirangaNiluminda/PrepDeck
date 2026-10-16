---
topic: react/composing-components
difficulty: medium
type: short-answer
tags: [react, components, hooks, interview-favourite, mosh-react]
source: mosh-react-s04
---

## Question
What's the difference between class components and function components? The course calls function components "stateless functional components". Is that still accurate?

## Answer
**Class component:** `class Navbar extends Component { render() { … } }`.
State lives in `this.state` and is changed with `this.setState`; lifecycle
methods include `componentDidMount`; props are read with `this.props`.

**Function component:** a function that takes props and returns JSX:
```jsx
const Navbar = ({ totalCounters }) => (
  <nav className="navbar">Total <span>{totalCounters}</span></nav>
);
```

**"Stateless" is outdated.** Before React 16.8 (2019), function components
couldn't hold state or use lifecycle methods, hence the name. **Hooks**
changed that: `useState` gives them state, `useEffect` covers lifecycle
work, and `useContext`, `useRef` and the rest fill the remaining gaps.

**Today, function components are the standard.** They have less boilerplate,
no `this` or binding, and logic is reusable through custom hooks. Class
components still work, and you'll meet them in older code. A few things
remain class-only, notably **error boundaries**.

## Key points
- class: this.state, setState, lifecycle methods, this.props
- function: props in, JSX out; no this
- hooks (React 16.8+) gave function components state and effects
- function components are the default today; classes appear in legacy code
- error boundaries still need a class
