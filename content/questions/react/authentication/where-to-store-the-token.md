---
topic: react/authentication
difficulty: hard
type: short-answer
tags: [authentication, jwt, security, xss, csrf, interview-favourite, mosh-react]
source: mosh-react-s09
---

## Question
The course stores the JWT in `localStorage`. What's the risk, what's the common alternative, and what new risk does that alternative bring?

## Answer
**`localStorage`** (what the course does) is simple: `setItem('token', jwt)`,
then attach it to requests yourself. But **any JavaScript running on the page
can read it**. One **XSS** bug, such as an injected script or a compromised
npm package, lets an attacker steal the token and use it from anywhere until
it expires.

**`httpOnly` cookie** (the common recommendation today): the server sets
`Set-Cookie: token=…; HttpOnly; Secure; SameSite=Lax`.
- **`HttpOnly`**: page scripts **can't read it**, so XSS can't steal it,
  although XSS can still act *as* the user while they're on the page.
- The browser **sends it automatically** with requests to that site.
- That auto-sending opens **CSRF**: another site triggering requests that
  carry the cookie. Mitigate with **`SameSite`** (Lax/Strict) plus CSRF tokens
  or origin checks for state-changing requests.

Either way: use **HTTPS**, **short-lived access tokens** with refresh tokens,
and prevent XSS in the first place. React's JSX escaping helps, but avoid
`dangerouslySetInnerHTML` with untrusted HTML.

Many teams now use an auth library or service (Auth.js/NextAuth, Clerk,
Auth0, Supabase) that handles this for them.

## Key points
- localStorage is readable by any script on the page, so XSS can steal the token
- httpOnly cookies can't be read by JS, and the browser sends them automatically
- cookies bring CSRF risk; mitigate with SameSite and CSRF tokens
- always HTTPS, short-lived tokens with refresh, and XSS prevention
