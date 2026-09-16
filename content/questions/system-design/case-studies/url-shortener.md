---
topic: system-design/case-studies
difficulty: medium
type: short-answer
tags: [system-design, caching, scaling, interview-favourite]
source: starter-seed
---

## Question
Design a URL shortener like bit.ly. What are the key components and trade-offs?

## Answer
**Requirements.** Create a short code for a long URL, and redirect from the code
quickly. Custom aliases, expiry and click analytics are common extras. Traffic
is read-heavy: redirects can outnumber creations 100 to 1.

**Generating codes.**
- Base62-encode a unique numeric id from a counter or id service. Seven base62
  characters give about 3.5 trillion codes with no collisions, but sequential
  codes are guessable unless the id is shuffled first.
- Hash the long URL and keep the first seven characters. Simple, but collisions
  must be detected and resolved.
- A key-generation service that hands out pre-generated unused codes.

**Storage.** A key-value mapping from code to long URL, plus owner, created and
expiry dates. Any store with fast lookups by key works; shard by code as it grows.

**Redirects.** Put a cache such as Redis in front of the store for hot codes.
Returning **301** lets browsers cache the redirect, which cuts load but hides
repeat clicks from analytics. **302** sends every click through your servers.

**Protection.** Rate-limit creation, check submitted URLs against malware lists,
and record click events asynchronously through a queue so redirects stay fast.

## Key points
- read-heavy: optimise the redirect path, cache hot codes
- base62 of a unique id avoids collisions; hashing needs collision handling
- 301 is cacheable but loses analytics; 302 keeps every click visible
- shard by code; write analytics asynchronously
