---
topic: react/forms
difficulty: easy
type: mcq
tags: [react, forms, events, mosh-react]
source: mosh-react-s07
---

## Question
Clicking Login in a React form reloads the whole page: the Network tab shows the HTML and the bundle downloading again. What's missing?

## Options
- [ ] The button needs `type="button"`
- [x] An `onSubmit` handler on the `<form>` that calls `e.preventDefault()` before doing the work
- [ ] The form needs `action={null}`
- [ ] `onClick` on the button instead of `onSubmit`

## Answer
By default a browser **submits the form to the server**, which means a full
round trip and a page reload. In a SPA you handle it yourself:

```jsx
function LoginForm() {
  const handleSubmit = (e) => {
    e.preventDefault();          // stop the browser's own submission
    // validate, call the server, then navigate
  };
  return <form onSubmit={handleSubmit}>…<button>Login</button></form>;
}
```

Use **`onSubmit` on the form**, not `onClick` on the button, so pressing
**Enter** in a field submits too. A `<button>` inside a form defaults to
`type="submit"`.

**Today:** React 19 also lets you pass a function to `<form action={fn}>`
(form Actions); React then handles the submission and gives you a `FormData`.

## Key points
- forms submit to the server and reload by default
- handle onSubmit on the form and call e.preventDefault()
- onSubmit also covers pressing Enter
- React 19: <form action={fn}> form Actions
