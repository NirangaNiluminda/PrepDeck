---
topic: react/authentication
difficulty: medium
type: short-answer
tags: [architecture, modules, dependencies, interview-favourite, mosh-react]
source: mosh-react-s09
---

## Question
To attach the token, `httpService` imports `authService` (`auth.getJwt()`), but `authService` already imports `httpService` to call `/auth`. What problem is this, and how do you fix it?

## Answer
That's a **bidirectional (circular) dependency**: each module depends on the
other. It may work today, but it's fragile. Module load order can leave one
import `undefined` at the moment it's used. The two can't be tested or reused
separately, and the coupling quietly spreads.

**Fix: decide which module is more fundamental, and make dependencies point
only one way.** HTTP is the **core** layer: authentication is meaningless
without it. So `auth` may depend on `http`, never the reverse.

Then **invert the call**. Instead of `http` asking `auth` for the token,
`auth` **hands** `http` the token:

```js
// httpService.js: no import of auth
function setJwt(jwt) { axios.defaults.headers.common['x-auth-token'] = jwt; }
export default { /* get, post… */ setJwt };

// authService.js
import http from './httpService';
http.setJwt(getJwt());   // push the token down when the module loads
```

The same idea in general: **lower layers expose a hook or setter, and higher
layers call it**, the dependency-inversion pattern. An interceptor that
receives a `getToken` function you pass in achieves the same thing.

## Key points
- circular imports are fragile: load-order surprises, tight coupling
- identify the core module (http); dependencies point toward it only
- invert the call: auth pushes the token into http (http.setJwt)
- lower layers expose hooks; higher layers call them
