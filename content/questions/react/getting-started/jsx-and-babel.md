---
topic: react/getting-started
difficulty: medium
type: short-answer
tags: [react, jsx, babel, interview-favourite, mosh-react]
source: mosh-react-s01
---

## Question
What is JSX? It looks like HTML inside JavaScript, so how does the browser run it?

## Answer
**JSX** (JavaScript XML) is a syntax extension that lets you describe UI with
HTML-like tags inside JavaScript. It is **neither a string nor HTML**:
browsers can't run it as-is.

A **compiler** turns each JSX expression into plain JavaScript function calls
before the code reaches the browser. Babel did this in Create React App; today
it's also done by esbuild/SWC in Vite and Next.js.

```jsx
const element = <h1>Hello World</h1>;

// compiles to (classic transform)
const element = React.createElement('h1', null, 'Hello World');
```

The arguments are the element **type**, its **props** (here `null`), and its
**children**. JSX is just a far more readable way to write those calls, which
is why components are always written in JSX.

## Key points
- JSX is a syntax extension, not HTML and not a string
- browsers can't run it; a compiler (Babel, esbuild, SWC) converts it first
- each tag becomes a call that creates a React element
- arguments: type, props, children

## Explanation
Since React 17 the default "automatic runtime" compiles JSX to `_jsx(...)`
calls imported from `react/jsx-runtime` instead of `React.createElement`. The
idea is identical: JSX becomes function calls that return React elements.
