---
topic: javascript/es6
difficulty: easy
type: short-answer
tags: [javascript, es6, modules, react, mosh-react]
source: mosh-react-s02
---

## Question
What's the difference between named and default exports? Read this line from older React code: `import React, { Component } from 'react';`

## Answer
- **Named exports**, `export function promote() {}`: a module can have **many**.
  You import them by their exact name **in braces**:
  `import { promote } from './teacher'`.
- **Default export**, `export default class Teacher {}`: at most **one** per
  module, its "main thing". You import it **without braces**, and you can
  name it anything: `import Teacher from './teacher'`.
- One module can have both: `import Teacher, { promote } from './teacher'`.

So `import React, { Component } from 'react'` takes the **default** export
(`React`) and the **named** export `Component` from the `react` package (no
`./`, so it comes from `node_modules`). Class components extended `Component`.

**Today** you'd mostly write `import { useState, useEffect } from 'react'`:
named exports, with no default `React` import needed for JSX (React 17+).

## Key points
- named exports: many per module, imported in braces by exact name
- default export: one per module, imported without braces, any name
- a module can have both: import X, { y } from '...'
- React today: import { useState } from 'react'
