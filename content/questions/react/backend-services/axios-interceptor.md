---
topic: react/backend-services
difficulty: medium
type: code
tags: [react, http, axios, error-handling, mosh-react]
source: mosh-react-s08
---

## Question
Every API call would need the same "log it and show a generic toast" code for unexpected errors. Handle them once, globally, while still letting individual calls handle their expected errors.

## Answer
Use an axios **response interceptor**. It runs for **every** response before
your own `await`/`catch`:

```js
// services/httpService.js
import axios from 'axios';
import { toast } from 'react-toastify';
import logger from './logService';

axios.interceptors.response.use(null, (error) => {   // (onSuccess, onError)
  const expectedError =
    error.response && error.response.status >= 400 && error.response.status < 500;

  if (!expectedError) {
    logger.log(error);
    toast.error('An unexpected error occurred.');
  }
  return Promise.reject(error);   // still pass the error on to the caller's catch
});

export default {
  get: axios.get, post: axios.post, put: axios.put, delete: axios.delete,
};
```

- `use(onFulfilled, onRejected)`: `null` skips successful responses.
- **Always return `Promise.reject(error)`.** Otherwise the caller's `await`
  "succeeds" with `undefined`.
- Callers add `try/catch` **only** when they have something specific to do
  (show "already deleted", roll back). Loading the list on mount doesn't need
  one: the interceptor already handles unexpected failures.

## Key points
- a response interceptor centralises unexpected-error handling
- log + generic toast for non-4xx; let 4xx through untouched
- return Promise.reject(error) so callers still see the error
- use try/catch only where a call needs specific handling or rollback
