---
topic: react/authentication
difficulty: medium
type: mcq
tags: [react, authorization, security, interview-favourite, mosh-react]
source: mosh-react-s09
---

## Question
You hide the "New movie" button and the Delete column from non-admins in the React UI. Is the delete action now protected?

## Options
- [ ] Yes: if users can't see the button, they can't delete
- [ ] Yes, as long as the route is also protected in React Router
- [x] No: anyone can still send the HTTP request (DevTools, curl, a script); the API must check the token and role on every request
- [ ] Only if the JavaScript bundle is minified

## Answer
**No.** Hiding elements is **UX**: users shouldn't see actions they can't
perform. But the frontend runs on the user's machine, under their control.
They can call `DELETE /api/movies/42` directly. **Real authorization lives on
the server**, which validates the token and the role (`401`/`403`) for every
request.

Do both: keep the UI tidy, **and** enforce access on the server. The course's
way of hiding the column is a good example of keeping things simple: build
the `columns` array and add the delete column only
`if (user && user.isAdmin)`, rather than adding "hidden column" support to the
generic table.

## Key points
- hiding UI is UX, not security
- clients are fully controllable; anyone can call the API
- the server enforces authentication and roles on every request
- build conditional UI the simplest way (include the column only for admins)
