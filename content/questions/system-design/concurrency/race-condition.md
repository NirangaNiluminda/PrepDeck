---
topic: system-design/concurrency
difficulty: medium
type: short-answer
tags: [concurrency, race-condition, databases]
source: starter-seed
---

## Question
What is a race condition? Give an example and explain how to prevent it.

## Answer
A race condition is a bug where the result depends on the unpredictable timing of
concurrent operations on shared state, at least one of which writes.

**Example (lost update).** Two withdrawal requests arrive together for an
account holding 100. Both read the balance (100), both check that 80 is
affordable, and both write back 20. Two withdrawals succeed where only one
should have. This is the classic *read-modify-write* or *check-then-act* pattern.

**Prevention.**
- **Mutual exclusion**: a lock or mutex so only one thread runs the critical
  section at a time.
- **Atomic operations**: let the database do the check and the write together,
  for example `UPDATE accounts SET balance = balance - 80 WHERE id = ? AND balance >= 80`,
  then check how many rows were affected.
- **Row locks** inside a transaction: `SELECT ... FOR UPDATE`.
- **Optimistic concurrency**: store a version number and only write if it
  hasn't changed since you read it; retry otherwise.
- **Avoid shared mutable state**: immutable data, or message passing between
  workers.

## Key points
- outcome depends on timing of concurrent access to shared state
- read-modify-write and check-then-act are the usual shapes
- locks, atomic updates, row locks in transactions
- optimistic concurrency with a version column
