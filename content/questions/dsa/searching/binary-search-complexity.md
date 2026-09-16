---
topic: dsa/searching
difficulty: easy
type: mcq
tags: [dsa, binary-search, complexity]
source: starter-seed
---

## Question
What is the worst-case time complexity of binary search on a sorted array of n elements?

## Options
- [ ] O(1)
- [x] O(log n)
- [ ] O(n)
- [ ] O(n log n)

## Answer
**O(log n).** Each comparison halves the remaining range, so after k steps about
n / 2^k elements remain. The search ends when that reaches 1, after roughly
log₂ n steps: about 20 comparisons for a million elements.

It needs sorted data with random access (an array, not a linked list). Two
classic bugs: computing the midpoint as `(lo + hi) / 2` can overflow in
fixed-width integer languages, so use `lo + (hi - lo) / 2`; and off-by-one errors
in the loop bounds.

## Key points
- halves the search range on every step
- about 20 steps for a million elements
- needs sorted, random-access data
- overflow-safe midpoint and careful bounds
