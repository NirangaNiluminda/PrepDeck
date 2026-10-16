---
topic: react/backend-services
difficulty: easy
type: mcq
tags: [http, rest, api, mosh-react]
source: mosh-react-s08
---

## Question
You only want to change a post's `title`. What's the difference between sending it with PUT and with PATCH?

## Options
- [ ] PUT is for creating, PATCH for updating
- [x] PUT replaces the whole resource, so you send the complete post; PATCH applies a partial update, so you can send just `{ title }`
- [ ] PATCH is only for deleting fields
- [ ] There is no difference; they're aliases

## Answer
**PUT** means "store this as the resource": send the **entire object**.
Leaving out fields may wipe them. **PATCH** means "apply these changes":
send **only the fields that change**, e.g. `http.patch('/posts/1', { title })`.
Both target the item URL. Which ones a given API supports is up to its
designers, so check its docs.

## Key points
- PUT = full replacement; send the whole resource
- PATCH = partial update; send only the changed fields
