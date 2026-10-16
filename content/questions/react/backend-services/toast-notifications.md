---
topic: react/backend-services
difficulty: easy
type: flashcard
tags: [react, ux, notifications, mosh-react]
source: mosh-react-s08
---

## Question
Why show errors with toast notifications instead of `alert()`, and how is a toast library like react-toastify set up?

## Answer
`alert()` **blocks** the page until it's dismissed, looks out of place, and
can't be styled. A **toast** is a small, non-blocking message that disappears
by itself. Render a **`<ToastContainer />`** once near the top of the app (and
import the library's CSS), then call `toast.error('…')`, `toast.success(…)` or
`toast.info(…)`, or just `toast('…')`, from anywhere, including non-React
modules like the HTTP service.

## Key points
- toasts are non-blocking and auto-dismiss; alert() blocks
- one <ToastContainer /> in the app; call toast.error/success anywhere
