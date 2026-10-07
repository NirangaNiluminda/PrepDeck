---
topic: dsa/sliding-window
difficulty: easy
type: code
tags: [dsa, sliding-window, arrays]
source: prep-chat-day1
---

## Question
Given daily temperatures and a window size `k`, return the maximum average temperature over any `k` consecutive days.

Example: `[10, 20, 30, 5, 40, 50, 10]`, `k = 4` → `31.25`

## Answer
This is the fixed-size sliding window again. Every window has the same size,
so the window with the **largest sum also has the largest average**: dividing
every sum by the same `k` never changes which is biggest. Track the max sum and
divide once at the end.

```python
def max_average(nums: list[int], k: int) -> float:
    window_sum = sum(nums[0:k])
    max_sum = window_sum

    for i in range(k, len(nums)):
        window_sum = window_sum - nums[i - k] + nums[i]
        max_sum = max(max_sum, window_sum)

    return max_sum / k                 # divide once, outside the loop
```

Windows: 65 → 95 → 125 → 105. The max sum is 125, and 125 / 4 = **31.25**.

O(n) time, O(1) space.

## Key points
- same size windows: comparing sums gives the same answer as comparing averages
- slide with old sum − nums[i − k] + nums[i]
- divide by k once, at the end, not on every iteration
- O(n) time, O(1) space

## Explanation
A typical bug is a slice like `nums[i:k]`, which ends at a fixed index k
instead of taking k elements from i. The window is `nums[i : i + k]`, but with
sliding you don't need a slice inside the loop at all.
