---
topic: react/getting-started
difficulty: easy
type: short-answer
tags: [react, npm, tooling, mosh-react]
source: mosh-react-s01
---

## Question
Why do you need Node.js installed to build a React app that runs in the browser? What does `npm i -g <package>` do, and how is `npx` different?

## Answer
React code runs in the browser, but the **tooling** runs on your machine
under Node.js, and that includes **npm**, Node's package manager. npm installs
React itself, plus the bundler, compiler and dev server, from the npm registry.

- `npm i <pkg>` installs into the current project's `node_modules` and records
  it in `package.json`.
- `npm i -g <pkg>` (`-g` for **global**) installs a command-line tool once for
  the whole machine. On macOS/Linux this can need `sudo` if permissions aren't
  set up.
- `npx <pkg>` **runs** a package's command without installing it globally,
  always fetching the latest version, or the one you name.

**Today** you'd create an app with `npm create vite@latest` (or
`npx create-next-app`) rather than installing a scaffolding tool globally. That
avoids an old global version going stale on your machine.

## Key points
- Node runs the tooling, not your React code
- npm installs packages; local install goes to node_modules and package.json
- -g installs a CLI tool globally
- npx runs a package without a global install
