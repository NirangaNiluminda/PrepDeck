---
topic: system-design/concurrency
difficulty: medium
type: short-answer
tags: [concurrency, deadlock, databases]
source: starter-seed
---

## Question
What is a deadlock? Which conditions cause one, and how do you prevent it?

## Answer
A deadlock is when two or more threads or transactions each wait for a resource
another one holds, so none of them can ever proceed. For example, transaction A
locks row 1 and waits for row 2, while transaction B locks row 2 and waits for
row 1.

All four **Coffman conditions** must hold:
1. **Mutual exclusion**: a resource can be held by only one party at a time.
2. **Hold and wait**: a party holds one resource while waiting for another.
3. **No preemption**: a resource can't be taken away; it must be released.
4. **Circular wait**: a cycle of parties, each waiting on the next.

Prevention means breaking at least one condition:
- **Lock ordering**: always acquire locks in the same global order (by id,
  say). This breaks circular wait and is the most practical fix.
- **Timeouts**: use try-lock with a timeout, release what you hold, back off
  and retry. This breaks hold-and-wait.
- **Short transactions**: hold locks for as little time as possible.

Databases detect deadlocks by finding cycles in a wait-for graph and abort one
transaction as the victim, so application code should expect that error and retry.

## Key points
- the four Coffman conditions must all hold
- consistent lock ordering breaks circular wait
- try-lock with timeout and backoff
- databases abort a victim transaction; retry it
