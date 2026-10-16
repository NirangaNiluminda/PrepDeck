---
topic: react/routing
difficulty: medium
type: short-answer
tags: [react, routing, url-design, mosh-react]
source: mosh-react-s06
---

## Question
A route `/posts/:year/:month` stops matching when the month is left out. How do you make parameters optional, and when should optional values go in the query string instead?

## Answer
Route parameters are **required by default**, so `/posts/2018` didn't match
and fell through to another route. A `?` makes one optional:
`/posts/:year?/:month?`. That's regex-style in v4, and supported again from
React Router v6.5.

As a rule, **avoid optional route parameters**. Use them only when they give
the URL a genuine **hierarchy**, as with "all posts / posts in 2018 / posts
in March 2018". Optional **filters and settings** belong in the **query
string**:

```
/posts/2018/03?sortBy=newest&approved=true
```

Query parameters are named, can be added in any combination and any order,
and they don't change which route matches.

## Key points
- route params are required; add ? to make one optional
- use path params for identity and hierarchy (/movies/:id)
- use the query string for optional filters, sorting and paging
- query params combine freely and don't affect route matching
