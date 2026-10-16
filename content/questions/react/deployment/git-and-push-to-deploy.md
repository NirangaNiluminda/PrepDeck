---
topic: react/deployment
difficulty: easy
type: flashcard
tags: [git, deployment, ci-cd, mosh-react]
source: mosh-react-s10
---

## Question
What must go in `.gitignore` before the first commit of a React or Node project, and what does "push to deploy" mean?

## Answer
Ignore **`node_modules/`** (hundreds of third-party files, reinstalled from
`package.json` and the lockfile), plus build output (`dist/`, `build/`) and
any **`.env` files containing real values**. Then
`git init` → `git add .` → `git commit -m "Initial commit"`.
**Push to deploy**: the host watches a Git repository (a Heroku remote in the
course; GitHub for Vercel, Netlify and Render), so every push builds and
deploys the latest code automatically. That's continuous deployment.

## Key points
- .gitignore: node_modules/, build output, real .env files
- pushing to the connected repo triggers build + deploy
