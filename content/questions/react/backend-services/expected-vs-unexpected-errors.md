---
topic: react/backend-services
difficulty: medium
type: short-answer
tags: [react, http, error-handling, axios, interview-favourite, mosh-react]
source: mosh-react-s08
---

## Question
What's the difference between expected and unexpected errors when calling an API? How should each be handled, and how do you tell them apart with axios?

## Answer
**Expected errors** are ones the API **predicts and returns on purpose**,
mostly **4xx client errors**: `404` (post already deleted), `400` (invalid
form data), `401/403`.
- Show a **specific** message: "This post has already been deleted", or the
  invalid fields.
- **Don't log them.** They aren't bugs: the user may simply have deleted the
  post in another tab.

**Unexpected errors** shouldn't happen under normal conditions: **network
down, server down, database down, a bug** (5xx, or no response at all).
- **Log them**, to a service you can actually read.
- Show a **generic, friendly** message: "An unexpected error occurred."

With axios, look at the error object:

```js
const expected =
  error.response &&               // there was an HTTP response…
  error.response.status >= 400 &&
  error.response.status < 500;    // …in the 4xx range
// no error.response at all means the network or server failed: unexpected
```

`error.response` is set only if a response came back. `error.request` is set
if a request was sent. Either way, revert any optimistic UI change.

## Key points
- expected = 4xx the API predicts: specific message, no logging
- unexpected = network/server/DB failure or bug: log it plus a generic message
- axios: error.response missing, or status outside 4xx, means unexpected
- revert optimistic changes in both cases
