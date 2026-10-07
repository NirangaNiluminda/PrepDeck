---
topic: databases/indexing
difficulty: easy
type: short-answer
tags: [databases, indexing, sql, explain]
source: prep-chat-day1
---

## Question
Your `users` table has millions of rows, and the login flow looks users up by `email` on every request. Should you index `email`? How would you add the index, and how do you check the query actually uses it?

## Answer
**Yes.** `email` is in the `WHERE` clause of a frequent query and is highly
selective (one row per value), which is exactly what an index is for. Make it a
**unique** index, which also enforces one account per email.

```sql
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- The query itself doesn't change; the optimiser chooses the index.
SELECT * FROM users WHERE email = 'john@example.com';

-- Check the plan: look for an index scan, not a sequential/full scan.
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';
```

The cost: every insert or email change also updates the index, and it uses
extra storage. For a column that's read on every login and rarely written,
that trade is clearly worth it.

## Key points
- index columns used often in WHERE, JOIN or ORDER BY
- email is highly selective, so the index narrows to one row
- a unique index also enforces the business rule
- queries don't change; verify with EXPLAIN (index scan vs full scan)
- cost: slower writes and extra storage
