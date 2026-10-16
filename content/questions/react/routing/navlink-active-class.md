---
topic: react/routing
difficulty: easy
type: flashcard
tags: [react, routing, react-router, navigation, mosh-react]
source: mosh-react-s06
---

## Question
How do you highlight the menu item for the page the user is currently on?

## Answer
Use **`<NavLink>`** instead of `<Link>`. It adds an **`active`** class
automatically while its `to` matches the current URL. For custom styling,
pass a function: `className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}`.
Use plain `<Link>` for things that shouldn't be highlighted, like the brand
logo.

## Key points
- NavLink applies "active" when its route matches
- className or style can be a function of { isActive }
