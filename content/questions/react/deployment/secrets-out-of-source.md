---
topic: react/deployment
difficulty: medium
type: short-answer
tags: [deployment, security, secrets, environment-variables, interview-favourite, mosh-react]
source: mosh-react-s10
---

## Question
The backend's `config/default.json` contains the production database connection string (with username and password) and the JWT signing key. Why is that dangerous, and where should those values live?

## Answer
Everything in the repository is shared with **everyone who can access the
repository**: teammates, CI systems, forks, and the world if it's ever made
public or leaked. Leaked database passwords on GitHub are a well-known cause
of real breaches, and bots scan public repositories for credentials within
minutes.

**Rule: never commit secrets.**
- Committed config files hold **only safe defaults** for local development
  (a local database URL, a dummy key).
- **Production secrets go in environment variables set on the server or
  hosting platform**: `heroku config:set vidly_db=…` in the course; today the
  Vercel / Render / Railway dashboard or CLI, or a secrets manager.
- The code reads them at run time (`process.env.VIDLY_DB`). The course's
  backend maps setting names to env vars with the `config` package's
  `custom-environment-variables.json`.
- Add `.env` files with real values to **`.gitignore`**, and commit a
  `.env.example` that lists the names without the values.
- If a secret is ever committed, **rotate it**. Deleting it from Git history
  isn't enough.

## Key points
- anything in the repo should be treated as public
- commit only safe dev defaults; never production secrets
- production secrets: env vars on the host or a secrets manager
- .gitignore real .env files; commit a .env.example
- a leaked secret must be rotated
