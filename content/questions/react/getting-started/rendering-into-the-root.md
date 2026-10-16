---
topic: react/getting-started
difficulty: medium
type: code
tags: [react, react-dom, rendering, interview-favourite, mosh-react]
source: mosh-react-s01
---

## Question
How does a React app get onto the page? Write the entry file (`index.js`) that renders an `App` component into the page, and say where it ends up in the HTML.

## Answer
`public/index.html` contains one empty container, `<div id="root"></div>`.
The entry file gets a reference to that real DOM node with plain JavaScript,
and asks **`react-dom`** to render the app inside it. React then owns
everything within that `div`.

```jsx
// React 18+ (current)
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

```jsx
// Older code (React 17 and earlier), as in courses from around 2018
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

In a real app you render only the **root component**. It renders its
children, and the whole component tree becomes the page's markup.

## Key points
- index.html has an empty div with id root
- react-dom renders the React tree into that real DOM node
- React 18+: createRoot(container).render(<App />)
- ReactDOM.render(element, container) is the legacy API, removed in React 19
- you render only the root App component; it renders the rest
