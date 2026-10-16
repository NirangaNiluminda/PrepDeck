---
topic: react/backend-services
difficulty: medium
type: short-answer
tags: [react, logging, sentry, monitoring, architecture, mosh-react]
source: mosh-react-s08
---

## Question
Why is `console.error` useless for tracking errors once the app is in production? What should you use instead, and how do you keep the vendor swappable?

## Answer
The console lives in **each user's browser**, so you never see it. In
production, unexpected errors must go to a **logging / error-monitoring
service** such as **Sentry** (others: LogRocket, Datadog). They give you:
- every error with its **stack trace**, browser, OS and **release/environment**
  tags (which version, prod or staging)
- **breadcrumbs**: the trail of requests and clicks that led to the error
- grouping, alerts, and assigning issues to developers

Hide the vendor behind **your own `logService`** with a tiny interface:

```js
// services/logService.js
import * as Sentry from '@sentry/react';

function init() {
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, release: '1.0.0', environment: import.meta.env.MODE });
}
function log(error) {
  Sentry.captureException(error);
}
export default { init, log };
```

`main.jsx` calls `logger.init()`, and the HTTP interceptor calls
`logger.log(error)`. **Only this file mentions Sentry**, so replacing it, or
logging to the console in development, is a one-file change. The course used
`raven-js` with `Raven.captureException`, Sentry's older SDK, now replaced by
`@sentry/react`.

## Key points
- users' consoles are invisible to you; use a logging service
- Sentry: stack traces, release/environment, breadcrumbs, alerts
- wrap the vendor in a logService with init() and log(error)
- only one file knows the vendor, so swapping is a one-file change
- raven-js is the old SDK; use @sentry/react today
