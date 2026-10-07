---
topic: dsa/fundamentals
difficulty: easy
type: mcq
tags: [dsa, edge-cases, arrays]
source: prep-chat-day1
---

## Question
This function is meant to return the maximum sum of any `k` consecutive elements. What does `max_sum([-5, -1, -8, -2], 2)` return?

```python
def max_sum(nums, k):
    max_value = 0
    for i in range(len(nums) - k + 1):
        if sum(nums[i:i + k]) > max_value:
            max_value = sum(nums[i:i + k])
    return max_value
```

## Options
- [x] 0
- [ ] -6
- [ ] -10
- [ ] It raises an error

## Answer
**0**, which is wrong. The window sums are −6, −9 and −10. None is greater
than 0, so `max_value` is never updated and the function returns a number that
isn't any window's sum. The correct answer is **−6**.

Fix it by starting from real data:

```python
max_value = sum(nums[0:k])   # the first window's actual sum
```

## Key points
- a running max starting at 0 silently fails when every value is negative
- initialise a running max or min from real data: the first element or the first window
- avoid magic starting values like 0, -1 or 999999
- test with all-negative input

## Explanation
Interviewers often probe exactly this edge case. If there's no natural first
value, Python's `float('-inf')` is the safe alternative.
