---
topic: databases/indexing
difficulty: easy
type: mcq
tags: [databases, indexing, b-tree, complexity]
source: prep-chat-day1
---

## Question
A `users` table has 1,000,000 rows. Roughly how many comparisons does finding one row by an indexed `email` take, compared with a full table scan?

## Options
- [x] About 20, versus up to 1,000,000
- [ ] About 1,000, versus up to 1,000,000
- [ ] About 500,000, versus up to 1,000,000
- [ ] The same, because the index only changes sort order

## Answer
**About 20.** An index keeps the keys sorted in a tree, so each step discards
most of the remaining candidates, like binary search: log₂(1,000,000) ≈ 20.
Without an index the database scans every row, up to a million comparisons.

Real databases use B+ trees, where each node holds hundreds of keys, so the
tree is only 3 or 4 levels deep: a handful of page reads.

## Key points
- full scan: O(n), up to every row
- index lookup: O(log n), about 20 steps for a million rows
- the query doesn't change; the optimiser picks the index
- confirm with EXPLAIN
