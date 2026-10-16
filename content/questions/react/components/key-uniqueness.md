---
topic: react/components
difficulty: easy
type: mcq
tags: [react, lists, keys, mosh-react]
source: mosh-react-s03
---

## Question
A page renders two lists, tags and movies. Within what scope must each `key` be unique?

## Options
- [ ] Across the whole application
- [ ] Across every element on the current page
- [x] Only among the siblings in the same list
- [ ] Keys don't need to be unique, only present

## Answer
**Only among siblings.** React compares children of the same parent, so a
key needs to be unique within *that* list. Tag `"1"` and movie `"1"` can
coexist. Duplicate keys within one list cause React to mix items up, and it
warns about it.

## Key points
- keys are compared among siblings
- the same key can appear in different lists
