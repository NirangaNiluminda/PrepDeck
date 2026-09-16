---
topic: security/web
difficulty: easy
type: short-answer
tags: [security, sql-injection, owasp]
source: starter-seed
---

## Question
What is SQL injection, and how do you prevent it?

## Answer
SQL injection happens when untrusted input is concatenated into a SQL string and
changes the structure of the query.

```ts
// Vulnerable: an email of  ' OR '1'='1  returns every user
db.query("SELECT * FROM users WHERE email = '" + email + "'");

// Safe: the value is sent as data and never parsed as SQL
db.query('SELECT * FROM users WHERE email = $1', [email]);
```

**Prevention.**
- Use **parameterised queries** (prepared statements) for every value.
  Query builders and ORMs do this when used as intended.
- **Allow-list** anything that can't be a parameter, such as a sort column or
  sort direction.
- Connect with a **least-privilege** database account, so an injection can't
  drop tables it has no rights to.
- Don't rely on escaping; it is easy to get wrong.

NoSQL databases have the same class of bug. Passing request JSON straight into
a Mongo query lets `{ "$ne": null }` match every document.

## Key points
- untrusted input changes the query's structure
- parameterised queries / prepared statements
- allow-list identifiers that can't be parameters
- least-privilege database accounts
- NoSQL operator injection is the same mistake
