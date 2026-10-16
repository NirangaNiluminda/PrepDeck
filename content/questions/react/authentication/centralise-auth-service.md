---
topic: react/authentication
difficulty: medium
type: short-answer
tags: [react, architecture, authentication, encapsulation, mosh-react]
source: mosh-react-s09
---

## Question
The login form calls `localStorage.setItem('token', …)`, the logout component calls `removeItem('token')`, `App` decodes the token, and the register form stores it too. What's wrong with that, and how should it be organised?

## Answer
Knowledge of **how authentication works**, where the token lives and what its
key is, is **scattered** across components. Rename the key, or move from
localStorage to cookies, and you hunt through the whole codebase.

Put it all in **one module, `authService`**, the only file that knows those
details:

```js
const tokenKey = 'token';                 // defined once

export async function login(email, password) { /* POST /auth, store the jwt */ }
export function loginWithJwt(jwt) { localStorage.setItem(tokenKey, jwt); } // after registering
export function logout() { localStorage.removeItem(tokenKey); }
export function getCurrentUser() { /* decode or return null */ }
export function getJwt() { return localStorage.getItem(tokenKey); }

export default { login, loginWithJwt, logout, getCurrentUser, getJwt };
```

Components then express **intent only**: `auth.login(...)`, `auth.logout()`,
`auth.getCurrentUser()`.

What happens **after** login (redirect, toast) **stays with the caller**. That
differs from screen to screen, so it isn't part of `login`'s job. The default
export lets callers write `auth.logout()`; the named exports still allow
importing a single function.

## Key points
- don't scatter storage keys and token handling across components
- one authService owns login, logout, current user, token access
- components call intent-level functions only
- what happens after login belongs to the caller
- a constant for the storage key
