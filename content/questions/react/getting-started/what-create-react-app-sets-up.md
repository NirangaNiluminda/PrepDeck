---
topic: react/getting-started
difficulty: medium
type: short-answer
tags: [react, create-react-app, tooling, webpack, babel, mosh-react]
source: mosh-react-s01
---

## Question
What does a project scaffolding tool like Create React App set up for you, what are the main folders in the project it creates, and what do people use instead today?

## Answer
**Create React App (CRA)** generated a ready-to-run project with **zero
configuration**:

- a **development server** with automatic reload (`npm start` on port 3000)
- **webpack** to bundle modules and assets
- **Babel** to compile JSX and modern JavaScript for browsers
- linting (ESLint), a test runner (Jest), and a production `build` script

The project layout:

| Path | Holds |
|---|---|
| `node_modules/` | React and every third-party library; never edited by hand |
| `public/` | static assets; `index.html` with the `<div id="root">` the app mounts into |
| `src/` | your code: `index.js` (the entry point), `App.js` (the root component), CSS |

**Today: CRA is deprecated.** The React team stopped recommending it in 2025.
New projects use **Vite** (`npm create vite@latest`, much faster dev server
and builds) or a framework such as **Next.js**. The ideas carry over: a dev
server, a bundler, a JSX compiler, and an `index.html` with a root element.

## Key points
- zero-config: dev server, bundler (webpack), compiler (Babel), lint, tests
- public/index.html holds the root div the app renders into
- src/index.js is the entry point, App is the root component
- CRA is deprecated; use Vite or Next.js for new projects
