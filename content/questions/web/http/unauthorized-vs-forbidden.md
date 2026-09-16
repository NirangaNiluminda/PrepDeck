---
topic: web/http
difficulty: easy
type: mcq
tags: [http, status-codes, auth]
source: starter-seed
---

## Question
A signed-in user requests a resource they are not allowed to access. Which status code should the API return?

## Options
- [ ] 400 Bad Request
- [ ] 401 Unauthorized
- [x] 403 Forbidden
- [ ] 404 Not Found

## Answer
**403 Forbidden.** The server knows who the caller is and refuses the action.

401 Unauthorized is misleadingly named: it means *not authenticated*, with
missing or invalid credentials, and should come with a `WWW-Authenticate`
header. Some APIs deliberately return 404 instead of 403 so they don't reveal
that the resource exists at all.

## Key points
- 401: not authenticated (who are you?)
- 403: authenticated but not permitted
- 404 can be used to hide a resource's existence
