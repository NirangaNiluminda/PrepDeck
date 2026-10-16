---
topic: react/backend-services
difficulty: medium
type: short-answer
tags: [react, architecture, http, config, environment-variables, mosh-react]
source: mosh-react-s08
---

## Question
Why wrap axios in your own `httpService` module instead of importing axios in every component? And where should the API's base URL live?

## Answer
**An `httpService` module** (exporting `get`, `post`, `put`, `delete`):
- **Hides the library.** Components import `http`, never axios. Switching to
  `fetch` or another client means changing **one file**, as long as the
  module keeps the same interface.
- **Keeps setup out of the app's entry point.** Interceptors, default headers
  and auth tokens live with the HTTP code, not in `App.js` or `index.js`.
- **Is portable.** Copy one file into the next project.

**The base URL** shouldn't be hard-coded in every service. The course moves it
to `config.json` (`{ "apiUrl": "http://localhost:3900/api" }`) and builds
URLs as `` `${apiUrl}/movies` ``. Each resource then gets a **service module**
(`movieService.getMovies`, `saveMovie`…), so components never assemble URLs.

**Today:** use **environment variables**, so dev, staging and production can
point at different APIs without code changes: `import.meta.env.VITE_API_URL`
in Vite, `process.env.NEXT_PUBLIC_API_URL` in Next.js. Never put secrets in
them: anything bundled into frontend code is public.

## Key points
- wrap the HTTP library; components depend on your module, not on axios
- interceptors and defaults live in that module
- one service per resource builds the URLs and calls http
- base URL: config file in the course; environment variables today
- frontend env vars are public; never put secrets there
