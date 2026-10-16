---
topic: react/deployment
difficulty: medium
type: short-answer
tags: [react, deployment, hosting, full-stack, mosh-react]
source: mosh-react-s10
---

## Question
Outline how you'd deploy a React frontend, a Node/Express API and a MongoDB database. The course used Heroku and mLab; what would you use today?

## Answer
**Order: database, then backend, then frontend**, verifying each one before
moving on. They can live in separate repositories and deploy independently;
many companies run one backend for several frontends (web, mobile).

1. **Database in the cloud.** The course used **mLab**, which has since been
   merged into **MongoDB Atlas**. Create a cluster and a database user, allow
   network access, and copy the connection string.
2. **Backend.** Deploy the Node/Express API to a host such as **Render,
   Railway or Fly.io** (the course used **Heroku**, which ended its free tier
   in 2022), or as serverless functions. Set the **connection string and JWT
   key as environment variables** on the host. Open `/api/genres` to check it.
3. **Frontend.** Set the production API URL (`VITE_API_URL=https://…/api`),
   build, and deploy the static output to **Vercel, Netlify, Cloudflare Pages**
   or any CDN. Configure the **SPA fallback**, so refreshing a deep link
   serves `index.html`.

All these hosts support **push-to-deploy**: connect the Git repository, and
every push to `main` builds and deploys automatically. The course did the same
with `git push heroku master`. Preview deployments for branches and pull
requests come free with most of them.

Allow the frontend's domain in the backend's **CORS** settings, and keep
secrets out of the frontend.

## Key points
- deploy DB, then backend (verify), then frontend
- frontend and backend can deploy separately
- today: Atlas for MongoDB; Render/Railway/Fly for the API; Vercel/Netlify for the frontend
- secrets as env vars on the host; frontend gets only the API URL
- push-to-deploy from Git; set the SPA fallback and CORS
