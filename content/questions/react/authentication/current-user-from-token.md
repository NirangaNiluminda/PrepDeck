---
topic: react/authentication
difficulty: medium
type: code
tags: [react, authentication, jwt, mosh-react]
source: mosh-react-s09
---

## Question
Write `getCurrentUser()` that returns the logged-in user's details from the stored JWT, or `null` for an anonymous visitor. Can the client trust these details for security decisions?

## Answer
Decode the token's payload, using the `jwt-decode` package or plain
`atob` on the middle segment, and treat a missing or garbled token as "no
user":

```js
// services/authService.js
import { jwtDecode } from 'jwt-decode';

const tokenKey = 'token';

export function getCurrentUser() {
  try {
    return jwtDecode(localStorage.getItem(tokenKey)); // { _id, name, email, isAdmin, iat }
  } catch {
    return null;   // no token (anonymous) or an invalid one: not an app error
  }
}
```

Decoding a `null` or empty token **throws** ("invalid token specified"),
which is why the `try/catch` is needed: without it the app crashes for every
signed-out visitor.

**Decoding is not verifying.** The client can't check the signature, because
it doesn't have the server's secret. Use the decoded user only for
**display and UX** (name in the navbar, which buttons to show). The **server**
re-validates the token on every request and makes the real authorization
decisions.

## Key points
- decode the stored JWT to read the user's claims
- missing or invalid token → catch → null (anonymous)
- decoding ≠ verifying: the client has no secret
- use it for UI only; the server enforces access
