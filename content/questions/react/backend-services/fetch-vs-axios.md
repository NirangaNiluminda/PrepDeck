---
topic: react/backend-services
difficulty: medium
type: short-answer
tags: [react, http, axios, fetch, interview-favourite, mosh-react]
source: mosh-react-s08
---

## Question
React has no built-in HTTP client. What are the main options, and how do `fetch` and axios differ in practice?

## Answer
React only renders, so **you choose the HTTP library**. Unlike Angular, it
doesn't force its own. The usual options are the browser's native **`fetch`**
and **axios**. jQuery's `$.ajax` is legacy.

| | `fetch` (built in) | axios (library) |
|---|---|---|
| install | nothing | `npm i axios` |
| JSON | `await res.json()` yourself | parsed for you: `response.data` |
| send JSON | `JSON.stringify` + `Content-Type` header yourself | pass the object |
| **HTTP errors (404, 500)** | **resolve normally**; you must check `res.ok` | **reject**, so they reach `catch` |
| interceptors (global error handling, auth headers) | no; write a wrapper | built in |
| timeouts, upload progress | `AbortController` / manual | options |

```js
// fetch: a 404 doesn't throw
const res = await fetch('/api/posts');
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const posts = await res.json();

// axios
const { data: posts } = await axios.get('/api/posts');
```

Either is fine. The point that matters is to **wrap whichever you choose in
your own `http` module**, so the rest of the app doesn't depend on it.

## Key points
- choose your own client: fetch (native) or axios
- fetch resolves on 4xx/5xx; check res.ok yourself
- axios parses JSON, rejects on HTTP errors, has interceptors
- wrap the client in your own module either way
