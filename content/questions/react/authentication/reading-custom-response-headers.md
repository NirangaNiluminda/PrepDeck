---
topic: react/authentication
difficulty: medium
type: mcq
tags: [http, cors, authentication, mosh-react]
source: mosh-react-s09
---

## Question
After registration, the server returns the new user's token in a custom response header, `x-auth-token`. Postman shows it, but in the browser `response.headers['x-auth-token']` is `undefined`. Why?

## Options
- [ ] Custom headers must start with `y-`
- [ ] axios strips all headers from responses
- [x] On cross-origin requests the browser exposes only a few "safe" response headers; the server must list `x-auth-token` in `Access-Control-Expose-Headers`
- [ ] The token is in the request headers, not the response

## Answer
It's **CORS**. For cross-origin responses, page scripts can only read a small
set of safelisted headers, such as `Content-Type`. The server has to opt in for
anything else:

```
Access-Control-Expose-Headers: x-auth-token
```

Then the client can do
`auth.loginWithJwt(response.headers['x-auth-token'])` and the new user is
logged in straight away. Returning the token **in the response body** avoids
the issue altogether. `x-` is just the old naming convention for
non-standard headers. Postman isn't a browser, so CORS rules don't apply to it.

## Key points
- browsers hide non-safelisted response headers on cross-origin requests
- the server must send Access-Control-Expose-Headers: x-auth-token
- or return the token in the response body
- Postman/curl ignore CORS
