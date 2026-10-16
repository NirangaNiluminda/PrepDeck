---
topic: react/routing
difficulty: medium
type: mcq
tags: [react, routing, navigation, react-router, interview-favourite, mosh-react]
source: mosh-react-s06
---

## Question
After a successful login you navigate the user to their dashboard in code. Which call ensures pressing **Back** doesn't return them to the login form?

## Options
- [ ] `navigate('/dashboard')`
- [x] `navigate('/dashboard', { replace: true })`
- [ ] `window.location.href = '/dashboard'`
- [ ] `navigate(-1)`

## Answer
**`replace: true`**. A normal navigation **pushes** a new entry onto the
history stack, so Back returns to the login page. **Replace** overwrites the
current entry, as if the login page had never been visited. That's ideal
after login, after a form redirect, or for redirects in general.

This is **programmatic navigation**: changing the page from code, e.g. after
a Save button or a form submit. In v4 the same choice was
`history.push('/products')` versus `history.replace('/products')`.
`window.location` would cause a full page reload, and `navigate(-1)` is
"go back".

## Key points
- push adds a history entry; replace overwrites the current one
- after login and redirects, use replace so Back skips them
- useNavigate() today; history.push/replace in v4
- window.location causes a full reload
