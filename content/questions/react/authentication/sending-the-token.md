---
topic: react/authentication
difficulty: medium
type: code
tags: [react, authentication, http, axios, jwt, mosh-react]
source: mosh-react-s09
---

## Question
After login, saving a movie returns **401 Unauthorized**: the endpoint now requires a token. Make every request carry the user's token automatically. The course uses an `x-auth-token` header; what's the standard?

## Answer
Configure it **once**, in the HTTP module, so no component thinks about it:

```js
// services/httpService.js (course style)
function setJwt(jwt) {
  axios.defaults.headers.common['x-auth-token'] = jwt;   // every method: get, post, put…
}
export default { get: axios.get, post: axios.post, put: axios.put, delete: axios.delete, setJwt };
```

**Standard: the `Authorization` header with the `Bearer` scheme**, usually
added in a **request interceptor**, so it always picks up the current token:

```js
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

- When there's no token (an anonymous user), the header isn't set at all.
- `401` means "not authenticated". A **response** interceptor can catch it to
  send the user to login, or to try a token refresh.
- With **httpOnly cookies** you don't attach anything: the browser sends the
  cookie itself (`withCredentials: true` for cross-origin requests).

## Key points
- attach the token centrally in the HTTP module, never per call
- standard: Authorization: Bearer <token> (course: x-auth-token)
- a request interceptor reads the current token on each request
- 401 = not authenticated; handle it globally
- cookies are sent by the browser automatically
