---
topic: databases/distributed
difficulty: hard
type: short-answer
tags: [databases, sharding, scaling, trade-offs]
source: starter-seed
---

## Question
What is the difference between partitioning and sharding, and how do you choose a shard key?

## Answer
**Partitioning** splits one large table into smaller pieces. *Horizontal*
partitioning splits rows, by date range for instance, and usually stays on one
database server; it makes maintenance easier and lets queries skip irrelevant
partitions. *Vertical* partitioning moves columns into separate tables.

**Sharding** is horizontal partitioning across *multiple servers*, each holding a
subset of the rows, so writes and storage can grow beyond one machine.

**A good shard key:**
- spreads data and traffic evenly, with no hot shard. Country is a poor key
  (a few countries dominate), and so is a timestamp that only increases (every
  new write lands on the last shard).
- matches the access pattern, so most queries hit a single shard. Tenant id or
  user id often works.
- rarely changes, since changing it means moving the row.

Strategies: **range** sharding keeps range queries cheap but risks hotspots;
**hash** sharding spreads load evenly but makes range queries touch every shard;
a **directory** maps keys to shards explicitly.

The costs are real: cross-shard joins and transactions are hard, and rebalancing
is operational work (consistent hashing reduces how much data moves). Shard
after indexing, caching, read replicas and bigger machines stop being enough.

## Key points
- partitioning splits a table; sharding spreads the pieces across servers
- shard key: high cardinality, even distribution, matches queries, stable
- range vs hash sharding trade-offs
- cross-shard joins, transactions and rebalancing are the cost
- shard last, after cheaper scaling options
