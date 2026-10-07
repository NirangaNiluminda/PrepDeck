---
topic: programming/python
difficulty: easy
type: mcq
tags: [python, loops, enumerate]
source: prep-chat-day1
---

## Question
What does this print?

```python
fruits = ["apple", "banana", "cherry"]

for index, fruit in enumerate(fruits):
    if fruit == "banana":
        print(index)
```

## Options
- [ ] 0
- [x] 1
- [ ] 2
- [ ] banana

## Answer
**1.** `enumerate(fruits)` yields `(index, value)` pairs: `(0, "apple")`,
`(1, "banana")`, `(2, "cherry")`. The loop unpacks each pair into `index` and
`fruit`, so when `fruit == "banana"`, `index` is 1.

`enumerate` replaces the manual pattern:

```python
for i in range(len(nums)):    # verbose
    num = nums[i]

for i, num in enumerate(nums):  # same thing, Pythonic
    ...
```

## Key points
- enumerate yields (index, value) tuples, starting at 0
- `for i, x in enumerate(items)` unpacks each tuple
- preferred over `range(len(items))` plus indexing
- `enumerate(items, start=1)` changes the starting index
