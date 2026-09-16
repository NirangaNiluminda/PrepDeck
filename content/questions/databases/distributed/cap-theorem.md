---
topic: databases/distributed
difficulty: hard
type: mcq
tags: [databases, distributed-systems, cap, interview-favourite]
source: starter-seed
---

## Question
According to the CAP theorem, what must a distributed data store choose between while a network partition is happening?

## Options
- [ ] Durability or isolation
- [x] Consistency or availability
- [ ] Latency or throughput
- [ ] Partition tolerance or consistency

## Answer
**Consistency or availability.** Networks do fail, so a distributed system can't
opt out of partition tolerance. The real choice is what happens while nodes
can't reach each other:

- **CP**: refuse or delay some requests so that no node returns stale or
  conflicting data. ZooKeeper behaves this way.
- **AP**: every node keeps answering, possibly with stale data, and the
  replicas reconcile after the partition heals. Cassandra behaves this way by
  default.

With no partition, a system can offer both. The PACELC extension adds that even
then, there is a trade-off between latency and consistency.

## Key points
- partitions are unavoidable, so P is not optional
- during a partition, choose consistency or availability
- CP rejects or blocks requests; AP answers and reconciles later
- PACELC: without a partition, trade latency against consistency
