---
topic: databases/indexing
difficulty: medium
type: short-answer
tags: [databases, indexing, performance, interview-favourite]
source: starter-seed
---

## Question
How does a database index speed up queries, and what does it cost?

## Answer
Most relational indexes are **B+ trees**: sorted keys with pointers to rows, kept
balanced and very shallow because each node holds many keys. Finding a key
takes O(log n) steps, a handful of page reads, instead of scanning the whole
table. Because the keys are sorted, the same index also serves range conditions
and `ORDER BY`.

- **Composite indexes** follow the *leftmost-prefix* rule: an index on
  `(a, b)` helps queries filtering on `a`, or on `a` and `b`, but not on `b` alone.
- A **covering index** contains every column a query needs, so the table
  itself is never read.

**Costs.**
- Every insert, update and delete must update each index, so writes slow down.
- Indexes take extra storage and memory.
- Low-selectivity columns (a boolean, a status with three values) gain little,
  and the optimiser may ignore them.

Index the columns used in `WHERE`, `JOIN` and `ORDER BY` on read-heavy tables,
and confirm the plan with `EXPLAIN`.

## Key points
- B+ tree gives O(log n) lookups and ordered range scans
- composite indexes follow the leftmost-prefix rule
- covering indexes avoid reading the table
- indexes slow writes and use storage
- low-selectivity columns benefit little; verify with EXPLAIN
