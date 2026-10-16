---
topic: javascript/es6
difficulty: medium
type: short-answer
tags: [javascript, es6, modules, mosh-react]
source: mosh-react-s02
---

## Question
How do ES6 modules work? What's visible outside a module by default, and what's the difference between `import { Person } from './person'` and `import React from 'react'`?

## Answer
A **module** is a file with its own scope. Everything declared in it is
**private by default**; to use something elsewhere you **`export`** it, and the
other file **`import`s** it. Splitting code into modules keeps files small and
dependencies explicit. Before ES6 this needed third-party systems such as
CommonJS or AMD.

Paths say where a module comes from:
- `'./person'` is a **relative path**: your own file in the current folder.
  Bundlers like Vite and webpack let you omit `.js`.
- `'react'` is a **bare specifier**: a package installed in `node_modules`
  and listed in `package.json`.

## Key points
- each file is a module with its own private scope
- export to make something public; import to use it
- ./ or ../ paths are your own files; bare names are packages in node_modules
- replaced older systems such as CommonJS (require)
