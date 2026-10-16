---
topic: react/authentication
difficulty: medium
type: short-answer
tags: [authentication, jwt, security, interview-favourite, mosh-react]
source: mosh-react-s09
---

## Question
What is a JSON Web Token? Describe its three parts, what "claims" are, and why a user can't simply edit their token to make themselves an admin. Can anyone read what's inside?

## Answer
A JWT is like an **ID card** the server issues after login. The client sends
it with later requests to prove who it is. It's three Base64URL strings
joined by dots, `header.payload.signature`:

1. **Header**: the token type and signing algorithm, e.g. `{ "alg": "HS256" }`.
2. **Payload**: **claims** about the user, e.g. `{ "_id": "…", "name": "Mosh",
   "isAdmin": true, "iat": 1690000000, "exp": … }`. The client can read these
   to show the user's name without asking the server.
3. **Signature**: computed from the header and payload using a **secret (or
   private key) that only the server has**.

**It can't be forged.** Change one character of the payload (`isAdmin: true`)
and the signature no longer matches. Without the server's secret, nobody can
produce a valid new one, so the server rejects the token.

**But it is not encrypted.** Base64URL is just an encoding: anyone holding the
token can decode it and read the payload, as jwt.io shows. **Never put
secrets** (passwords, sensitive personal data) in a JWT.

Claims are fixed until the token is reissued. Make a user admin in the
database, and their **existing token still says they're not**: they must log
in again (or refresh the token) to get the new claim.

## Key points
- header.payload.signature, each Base64URL-encoded
- payload = claims about the user (id, name, roles, issued-at, expiry)
- the signature uses a server-only secret, so tampering is detected
- encoded, not encrypted: anyone can read the payload, so no secrets in it
- claims are frozen until a new token is issued
