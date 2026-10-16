---
topic: react/deployment
difficulty: medium
type: mcq
tags: [deployment, debugging, logs, mongodb, mosh-react]
source: mosh-react-s10
---

## Question
The freshly deployed API shows "Application error". The host's logs contain `MongoNetworkError: failed to connect to server [localhost:27017]`. What's the most likely cause?

## Options
- [ ] The free plan blocks MongoDB connections
- [x] The app is still using its development config, which points at a MongoDB on `localhost`; set the cloud database's connection string as an environment variable on the host and read it in code
- [ ] Port 27017 must be opened in the browser
- [ ] The JWT key is missing

## Answer
`localhost:27017` is MongoDB's default address **on your own machine**.
There's no database there on the server, so the app crashes at start-up. The
default config was never overridden for production.

**Fix:** create the database in the cloud (Atlas), put its connection string in
an **environment variable on the host** (e.g. `VIDLY_DB`), make the app read
it in production, and redeploy.

The general lesson: when a deploy fails, **read the logs first**
(`heroku logs` in the course; the Logs or Functions tab on Vercel, Render or
Railway). The real error is almost always printed there.

## Key points
- localhost in production logs = dev config leaked into prod
- point production at the cloud DB via an environment variable
- always start debugging a failed deploy from the host's logs
