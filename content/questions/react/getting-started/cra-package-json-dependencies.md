---
topic: react/getting-started
difficulty: easy
type: mcq
tags: [react, create-react-app, npm, mosh-react]
source: mosh-react-s01
---

## Question
A fresh Create React App project bundles code with webpack and compiles it with Babel, yet its `package.json` lists only `react`, `react-dom` and `react-scripts` as dependencies. Why?

## Options
- [ ] webpack and Babel are built into the browser
- [ ] npm installs webpack and Babel globally the first time you run `npm start`
- [x] `react-scripts` depends on them and wraps their configuration, so they never appear in your `package.json`
- [ ] They are listed under `devDependencies` instead

## Answer
**`react-scripts` brings them in.** It depends on webpack, Babel, ESLint,
Jest and the rest, and provides the `start`, `build`, `test` and `eject`
scripts that drive them. Keeping that complexity inside one package is what
makes CRA "zero-config". After `npm run eject`, all of those dependencies, and
their configuration, move into your own project.

## Key points
- react-scripts wraps webpack, Babel, ESLint and Jest
- scripts: start (dev server), build (production), test, eject
- ejecting moves the hidden dependencies into package.json
