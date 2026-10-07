---
topic: dsa/sliding-window
difficulty: easy
type: code
tags: [dsa, sliding-window, arrays]
source: prep-chat-day1
---

## Question
Given an array of integers and a number `k`, return the maximum sum of any contiguous subarray of size `k`.

Example: `[2, 1, 5, 1, 3, 2]`, `k = 3` → `9` (from `[5, 1, 3]`)

## Answer
Recomputing every window from scratch is O(n·k). Instead, compute the first
window's sum once, then **slide**: each step one element leaves the window and
one enters, so the new sum is `old_sum - leaving + entering`, which is O(1) per step.

```python
def max_sum_window(nums: list[int], k: int) -> int:
    window_sum = sum(nums[0:k])        # first window
    max_sum = window_sum               # start from real data, not 0

    for i in range(k, len(nums)):      # i is the index entering the window
        window_sum = window_sum - nums[i - k] + nums[i]
        max_sum = max(max_sum, window_sum)

    return max_sum
```

| i | leaving `nums[i-k]` | entering `nums[i]` | window sum | max |
|---|---|---|---|---|
| start | | | 2+1+5 = 8 | 8 |
| 3 | 2 | 1 | 7 | 8 |
| 4 | 1 | 3 | 9 | 9 |
| 5 | 5 | 2 | 6 | 9 |

O(n) time: each element is added once and removed once. O(1) extra space.

## Key points
- brute force recomputes each window: O(n·k)
- slide: new sum = old sum − nums[i − k] + nums[i]
- initialise the max from the first window, not 0, so all-negative arrays work
- loop from i = k to the end; works for any k, nothing is hardcoded
- O(n) time, O(1) space

## Explanation
If you do write the brute-force version first, the number of windows is
`len(nums) - k + 1`, so the loop is `range(len(nums) - k + 1)`, and each window
is the slice `nums[i : i + k]`. Writing `nums[i] + nums[i+1] + nums[i+2]` only
works for k = 3. The same pattern extends to variable-size windows, such as the
longest substring without repeating characters.
