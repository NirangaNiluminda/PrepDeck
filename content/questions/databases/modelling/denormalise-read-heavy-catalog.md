---
topic: databases/modelling
difficulty: medium
type: short-answer
tags: [databases, denormalisation, performance, caching, trade-offs]
source: prep-chat-day1
---

## Question
An e-commerce product catalog page loads slowly because every page view joins five tables: products, categories, brands, reviews and inventory. The catalog rarely changes but is read constantly. Would you normalise or denormalise, and why?

## Answer
**Denormalise** the read path. Copy the fields the page needs (category name,
brand name, average rating) into the product rows, or into a dedicated
read-optimised table or view, so one query returns everything without five joins.

Denormalisation's main risk is **inconsistency**: the duplicated copies can
drift apart when the source changes. Because this data **rarely changes**, the
copies rarely need updating, so the risk is small and easy to manage: refresh
them when a product, brand or category changes, or on a schedule.

Keep fast-changing data such as **inventory** out of the copy, or read it
separately, since stale stock levels do real harm.

**Caching** is a complementary layer on top, not a replacement for the
database design: cache the rendered catalog in a CDN or Redis, or on the
client, so most requests never reach the database at all.

## Key points
- read-heavy and rarely updated favours denormalisation
- removes the joins from the hot read path
- the cost is keeping duplicated data consistent; rare updates make that cheap
- keep volatile data like inventory out of the copy
- caching (CDN, Redis, client) adds on top of good schema design

## Explanation
The reverse case, data written often and correctness critical (banking,
orders), favours a normalised schema, accepting the extra joins. Answer the
database question first, then mention caching as an extra layer; interviewers
want to see that you know which layer solves what.
