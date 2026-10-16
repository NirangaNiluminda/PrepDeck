---
topic: react/getting-started
difficulty: medium
type: short-answer
tags: [react, architecture, full-stack, firebase, trade-offs, mosh-react]
source: mosh-react-s01
---

## Question
For a React app's backend, when would you build your own API (e.g. Node.js + Express) and when would you use a backend-as-a-service such as Firebase? What are the trade-offs?

## Answer
**Backend-as-a-service (Firebase, Supabase):** you connect the React app with
a few lines of SDK code and get a database, auth and hosting without writing a
server.
- ✅ very fast to start; good for prototypes, hackathons and small apps
- ❌ costs can climb with usage, you're tied to that vendor, and complex
  business logic or custom auth is harder

**Your own API (Node.js + Express, or ASP.NET, Django…):**
- ✅ full control over logic, data model, security and cost; it's what most
  companies run in-house
- ❌ more to build, host and maintain

For a JavaScript developer, **Node.js + Express** is the quickest route to
your own backend, because it's the same language as the frontend. Learning it
is how a frontend developer becomes full-stack. Either way, the React side
does the same thing: it calls the backend over HTTP.

## Key points
- BaaS (Firebase): fastest start, but cost, lock-in, less control
- own API: full control of logic, security and cost; more work
- most companies build their own backend in-house
- Node + Express keeps a JavaScript developer in one language
