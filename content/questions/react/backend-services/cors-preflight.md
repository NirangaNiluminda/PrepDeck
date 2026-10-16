---
topic: react/backend-services
difficulty: medium
type: short-answer
tags: [http, cors, security, browser, interview-favourite, mosh-react]
source: mosh-react-s08
---

## Question
Your app on `http://localhost:3000` sends a POST to `https://api.example.com/posts`. The Network tab shows an `OPTIONS` request (status 204) just before the POST. What is it, and why does the browser send it?

## Answer
It's a **CORS preflight request**. The page and the API are on **different
origins** (scheme + host + port). By default the browser's **same-origin
policy** stops a page from reading responses from another origin, for
security. **CORS** (*Cross-Origin Resource Sharing*) is how a server opts in.

For "non-simple" requests (e.g. JSON bodies, `PUT`/`DELETE`, or custom
headers like `Authorization`), the browser first sends an **`OPTIONS`**
request asking whether the real one is allowed. The server answers with
headers such as:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

Only if those allow it does the browser send the actual POST (here: `201
Created`).

- CORS is enforced **by the browser**; curl and Postman ignore it.
- A "CORS error" is fixed on the **server**, by allowing the origin, or by
  proxying through your own origin in development. Never by changing the
  React code.

## Key points
- different origin (scheme/host/port) means a cross-origin request
- the browser sends an OPTIONS preflight before non-simple requests
- the server must answer with Access-Control-Allow-* headers
- enforced by browsers only; fix CORS on the server (or with a dev proxy)
