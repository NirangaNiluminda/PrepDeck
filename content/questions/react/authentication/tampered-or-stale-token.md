---
topic: react/authentication
difficulty: medium
type: mcq
tags: [authentication, jwt, security, authorization, mosh-react]
source: mosh-react-s09
---

## Question
An admin sets `isAdmin: true` on a user in the database, but that user's Delete request still returns **403 Forbidden**. Why?

## Options
- [ ] The database change takes 24 hours to apply
- [x] The server reads `isAdmin` from the user's JWT, and their current token was issued before the change; they need a new token, by logging in again or refreshing it
- [ ] 403 means the token is missing, so the client didn't send it
- [ ] The browser cached the earlier 403 response

## Answer
The server builds the user from the **claims inside the token**, not from the
database, on every request. The token was signed **before** the promotion, so
it still lacks `isAdmin`. Logging out and back in issues a token with the new
claim. That's the trade-off of stateless tokens: claims can be stale until the
token is reissued, which is one reason to keep token lifetimes short.

And the reverse can't happen. A non-admin who edits `isAdmin: true` into their
own token's payload breaks the **signature**, and the server rejects it.

## Key points
- servers trust claims in a validly signed token
- role changes take effect only when a new token is issued
- edited payloads break the signature and are rejected
- 403 = known user, not allowed; 401 = not authenticated
