---
topic: system-design/case-studies
difficulty: hard
type: short-answer
tags: [system-design, rate-limiting, redis, trade-offs]
source: starter-seed
---

## Question
How would you design a rate limiter for a public API? Compare the common algorithms.

## Answer
**Placement.** Enforce limits at the API gateway or in middleware, keyed by API
key, user id or client IP. Reject with **429 Too Many Requests**, a
`Retry-After` header, and ideally headers showing the remaining quota.

**Algorithms.**
- **Fixed window counter**: count requests per key per window, such as per
  minute. Cheap and simple, but a client can send up to twice the limit across a
  window boundary.
- **Sliding window log**: keep a timestamp for every request. Exact, but memory
  grows with traffic.
- **Sliding window counter**: weight the previous window's count by how much of
  it overlaps the current window. A close approximation with little memory.
- **Token bucket**: a bucket holds up to N tokens, refilled at a steady rate,
  and each request spends one. Allows bursts up to N while enforcing the average
  rate. Widely used, including by AWS API Gateway.
- **Leaky bucket**: requests queue and drain at a fixed rate. Smooths traffic
  completely, so there are no bursts.

**Across many servers.** Counters must be shared, typically in Redis. Reading
and then writing a counter is itself a race, so use atomic operations (`INCR`
with `EXPIRE`, or a Lua script for a token bucket). Also decide whether to
**fail open** (allow traffic) or **fail closed** (reject it) when Redis is down.

## Key points
- return 429 with Retry-After
- fixed windows allow bursts at window boundaries
- token bucket permits bursts while enforcing an average rate
- distributed limits need a shared store with atomic updates
- choose fail-open or fail-closed for when the store is unavailable
