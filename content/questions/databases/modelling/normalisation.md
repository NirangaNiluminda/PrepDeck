---
topic: databases/modelling
difficulty: medium
type: short-answer
tags: [databases, normalisation, trade-offs]
source: starter-seed
---

## Question
What is normalisation? Explain 1NF, 2NF and 3NF, and when you might denormalise.

## Answer
Normalisation organises tables to remove redundant data, which prevents update,
insert and delete anomalies: a fact stored twice can end up with two different
values.

- **1NF**: every column holds a single atomic value, with no repeating groups
  or lists in a column, and every row can be identified by a key.
- **2NF**: 1NF, and every non-key column depends on the *whole* primary key. With a
  composite key `(order_id, product_id)`, `product_name` depends only on
  `product_id`, so it belongs in a products table.
- **3NF**: 2NF, and no transitive dependencies: non-key columns depend only on
  the key, not on other non-key columns. Storing `customer_city` in `orders`
  breaks 3NF, because the city depends on `customer_id`.

**Denormalising** means deliberately duplicating data for read performance:
avoiding expensive joins on hot read paths, storing precomputed totals, or
building reporting tables. You accept the cost of keeping the copies consistent.

## Key points
- removes redundancy and update anomalies
- 1NF: atomic values, no repeating groups
- 2NF: no partial dependency on a composite key
- 3NF: no transitive dependency between non-key columns
- denormalise for read-heavy paths, accepting the consistency cost
