---
topic: dsa/two-pointers
difficulty: easy
type: code
tags: [dsa, two-pointers, arrays]
source: starter-seed
---

## Question
Given an array of integers **sorted in ascending order** and a target, return the indices of two numbers that add up to the target, or `null` if there are none. Use O(n) time and O(1) extra space.

## Answer
Start one pointer at each end. If the pair's sum is too small, move the left
pointer right to get a bigger number; if it's too large, move the right pointer
left. Sorting guarantees each move discards a value that can't be part of any
valid pair.

```ts
function pairWithSum(nums: number[], target: number): [number, number] | null {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return null;
}
```

O(n) time, O(1) space. For an **unsorted** array, use a hash map of values seen
so far (O(n) time, O(n) space); sorting first would cost O(n log n) and lose the
original indices.

## Key points
- relies on the input being sorted
- move the pointer that pushes the sum towards the target
- O(n) time, O(1) space
- unsorted input: use a hash map instead
