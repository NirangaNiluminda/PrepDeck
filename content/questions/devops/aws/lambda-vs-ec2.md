---
topic: devops/aws
difficulty: medium
type: short-answer
tags: [aws, serverless, trade-offs]
source: starter-seed
---

## Question
When would you choose AWS Lambda over EC2, and when would EC2 be the better fit?

## Answer
**Lambda** runs functions in response to events without servers to manage. It
scales automatically, including down to zero, and you pay per request and per
unit of execution time. The trade-offs: a 15-minute maximum run time, cold-start
latency after idle periods, limited control over the runtime environment, and
account-level concurrency limits. It suits spiky or unpredictable traffic,
event processing (S3 uploads, queue messages) and glue code.

**EC2** gives you whole virtual machines. You control the OS and software, and
you own patching and scaling (usually with Auto Scaling groups). You pay while
instances run, whatever the load. It suits long-running processes, persistent
connections, software with special OS needs, and steady high traffic, where it
is often cheaper than paying per invocation.

## Key points
- Lambda: no servers, scales to zero, pay per use
- Lambda limits: 15-minute timeout, cold starts, less control
- EC2: full control, but you manage patching and scaling
- steady, high load is often cheaper on EC2; spiky load favours Lambda
