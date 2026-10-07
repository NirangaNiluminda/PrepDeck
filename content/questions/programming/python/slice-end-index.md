---
topic: programming/python
difficulty: easy
type: mcq
tags: [python, slicing, arrays, sliding-window]
source: prep-chat-day1
---

## Question
`nums = [10, 20, 30, 5, 40, 50, 10]`, `i = 2`, `k = 4`. You want the window of `k` elements starting at index `i`. What does `nums[i:k]` give?

## Options
- [x] [30, 5]
- [ ] [30, 5, 40, 50]
- [ ] [20, 30, 5, 40]
- [ ] []

## Answer
**`[30, 5]`.** A slice `nums[start:stop]` takes elements from `start` up to but
**not including** `stop`. So `nums[2:4]` is indices 2 and 3: two elements, not four.

To take `k` elements from `i`, the stop has to move with the start:

```python
nums[i : i + k]   # [30, 5, 40, 50]
```

## Key points
- slices are `[start:stop)`: stop is exclusive
- `nums[i:k]` ends at a fixed index k, not after k elements
- a window of k elements starting at i is `nums[i : i + k]`
- the number of windows of size k is `len(nums) - k + 1`
