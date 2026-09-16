---
topic: databases/transactions
difficulty: easy
type: flashcard
tags: [databases, transactions, acid]
source: starter-seed
---

## Question
What does each letter in ACID stand for?

## Answer
- **Atomicity**: a transaction is all or nothing; if any part fails, all of it is
  rolled back.
- **Consistency**: a transaction takes the database from one valid state to
  another, never violating constraints.
- **Isolation**: concurrent transactions don't see each other's intermediate
  changes, to the degree set by the isolation level.
- **Durability**: once committed, changes survive crashes, typically thanks to a
  write-ahead log.

## Key points
- atomicity
- consistency
- isolation
- durability
