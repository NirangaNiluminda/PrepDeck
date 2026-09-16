---
topic: databases/transactions
difficulty: medium
type: short-answer
tags: [databases, nosql, consistency, trade-offs]
source: starter-seed
---

## Question
Compare ACID and BASE. When would you choose a BASE system?

## Answer
**ACID** systems, typically relational databases, guarantee that each transaction
is correct and immediately visible to everyone once committed.

**BASE** (*Basically Available, Soft state, Eventually consistent*) describes
many distributed NoSQL stores that put availability and scale first. The system
keeps answering even when parts of it fail, replicas may disagree for a short
time, and they converge on the same data eventually.

Choose BASE when scale and availability matter more than instant consistency and
briefly stale data does no harm: social feeds, like counts, product catalogues,
analytics. Keep ACID for money, stock levels and bookings, anywhere a lost or
duplicated write is unacceptable. Large systems often use both for different data.

## Key points
- ACID: strong consistency per transaction
- BASE: basically available, soft state, eventually consistent
- BASE trades immediate consistency for availability and scale
- use ACID for money and inventory, BASE where staleness is harmless
