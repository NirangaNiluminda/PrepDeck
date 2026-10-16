---
topic: react/getting-started
difficulty: medium
type: short-answer
tags: [react, create-react-app, tooling, webpack, mosh-react]
source: mosh-react-s01
---

## Question
In Create React App, what does `npm run eject` do, why would you use it, and why does the tool warn you before running it?

## Answer
CRA hides all of its configuration (webpack, Babel, ESLint, Jest) inside a
single dependency, **`react-scripts`**. **Ejecting** copies every one of
those configuration files and dependencies into your project: a `config/`
folder appears and `package.json` suddenly lists dozens of packages. You can
then edit anything, for example a custom webpack setting.

It's a **one-way street**: you can't un-eject. From then on you own and
maintain all that configuration, and you can no longer upgrade by bumping
`react-scripts`. Hence the "this action is permanent" warning, and the advice
to eject only if you really need to and know the tools.

**Today** you'd avoid the dilemma altogether. Vite has a small, editable
`vite.config.js` from day one, so there's nothing hidden to eject from.

## Key points
- CRA hides config inside react-scripts
- eject copies all config and dependencies into the project
- lets you customise webpack, Babel and so on
- permanent: no going back, and you maintain it all yourself
- Vite exposes a small config file from the start
