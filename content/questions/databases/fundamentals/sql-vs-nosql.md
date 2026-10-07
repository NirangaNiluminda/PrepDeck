---
topic: databases/fundamentals
difficulty: medium
type: short-answer
tags: [databases, sql, nosql, trade-offs, interview-favourite]
source: prep-chat-day1
---

## Question
What's the difference between SQL and NoSQL databases, and when would you choose NoSQL?

## Answer
| | SQL (relational) | NoSQL |
|---|---|---|
| Structure | tables with a fixed schema | flexible: documents, key-value, wide-column, graph |
| Examples | PostgreSQL, MySQL | MongoDB, Redis, Cassandra, Neo4j |
| Relationships | joins and foreign keys | usually embedded or denormalised |
| Consistency | strong, ACID transactions | often eventual consistency (BASE), tunable |
| Scaling | mainly vertical; horizontal is harder | built to scale horizontally across many nodes |

**Choose NoSQL** when the data has no fixed shape or changes shape often, when
you need to scale writes horizontally across many servers, or when you store
huge volumes of semi-structured data: logs, events, activity feeds, caches.

**Choose SQL** when the data is relational and correctness matters:
multi-row transactions, money, inventory, reporting with complex joins.

Many systems use both, for example PostgreSQL for orders and Redis for sessions.

## Key points
- SQL: fixed schema, relations, joins, ACID transactions
- NoSQL: flexible schema, several data models (document, key-value, column, graph)
- NoSQL scales horizontally more easily, often trading away strong consistency
- pick by access pattern and consistency needs, not fashion
- using both in one system is normal

## Explanation
"NoSQL can't do transactions" is outdated: MongoDB supports multi-document
transactions, and PostgreSQL stores JSON documents. The real difference is
the default trade-offs each is designed around.
