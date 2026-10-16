---
topic: react/getting-started
difficulty: easy
type: short-answer
tags: [react, architecture, full-stack, http, mosh-react]
source: mosh-react-s01
---

## Question
Describe the two halves of a typical web app. Where does React fit, and how do the halves talk to each other?

## Answer
- **Frontend (client):** runs in the browser or on the phone. It's the UI the
  user sees and interacts with. **React lives here.**
- **Backend (server):** stores and processes data, applies business rules,
  enforces security, sends notifications, runs background jobs.

They communicate over **HTTP**: the frontend calls the backend's API (usually
JSON) to read or save data. React only covers the frontend, so a real app also
needs a backend, built with Node.js + Express, ASP.NET, Django and so on, or
provided as a service.

## Key points
- frontend = UI on the client; React is a frontend library
- backend = data, business logic, security, on the server
- they talk over HTTP, usually a JSON API
- React apps still need a separately built (or hosted) backend
