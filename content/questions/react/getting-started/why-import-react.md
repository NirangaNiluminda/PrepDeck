---
topic: react/getting-started
difficulty: medium
type: short-answer
tags: [react, jsx, babel, mosh-react]
source: mosh-react-s01
---

## Question
Older React code has `import React from 'react'` at the top of every file that uses JSX, even when `React` is never referenced. Why? Is it still needed?

## Answer
With the **classic JSX transform**, the compiler rewrote every JSX tag into a
`React.createElement(...)` call. The compiled file therefore referenced
`React` even though your source didn't, and without the import it failed with
**"React is not defined"**.

**Since React 17** the **automatic runtime** is the default: the compiler
inserts its own import from `react/jsx-runtime`. So you no longer import React
just for JSX. You import only what you use, e.g.
`import { useState } from 'react'`.

## Key points
- classic transform: JSX became React.createElement calls
- so React had to be in scope, or "React is not defined"
- React 17+ automatic runtime injects its own import
- today, import React only for what you actually use
