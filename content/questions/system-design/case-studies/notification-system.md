---
topic: system-design/case-studies
difficulty: hard
type: short-answer
tags: [system-design, queues, reliability]
source: starter-seed
---

## Question
Design a notification system that sends email, SMS and push notifications for many internal services.

## Answer
**Notification API.** Services send a request with the user, a template, its
data, the channels and a priority. The API validates it, queues it and returns
immediately, so callers never wait on a third-party provider.

**User preferences.** A store of contact details, device tokens, opt-outs,
channel preferences and quiet hours, checked before anything is sent.

**Queues per channel** (Kafka, SQS or similar). They absorb traffic spikes,
isolate slow providers, and let each channel scale on its own.

**Channel workers.** Render templates and call the providers (for example SES
for email, Twilio for SMS, APNs and FCM for push), respecting each provider's
rate limits.

**Reliability.**
- Retry with exponential backoff; move repeated failures to a dead-letter queue.
- Give each notification an idempotency key so a retry never sends twice.
- Log every notification's status (queued, sent, delivered, failed) for support
  and auditing.

**Priorities and limits.** Separate high-priority queues so one-time passwords
aren't stuck behind a marketing blast, and cap how many notifications one user
can receive in a period.

## Key points
- accept requests asynchronously; queues decouple callers from slow providers
- separate queues and workers per channel
- retries with backoff, a dead-letter queue, idempotency keys
- honour user preferences and opt-outs
- prioritise transactional messages over marketing
