---
topic: dsa/hashing
difficulty: easy
type: code
tags: [dsa, hash-map, arrays, interview-favourite]
source: prep-chat-day1
---

## Question
Given an **unsorted** array of integers and a target, return the indices of the two numbers that add up to the target. The brute-force answer checks every pair in O(n²). Do it in O(n).

Example: `[2, 7, 11, 15]`, target `9` → `[0, 1]`

## Answer
For each number, the only partner that works is `target - num`. Walk the array
once, and keep a **dictionary of value → index** for every number already seen.
Before storing the current number, check whether its complement is already in
the dictionary.

```python
def two_sum(nums: list[int], target: int) -> list[int] | None:
    seen: dict[int, int] = {}          # value -> index where we saw it

    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:         # check first...
            return [seen[complement], i]
        seen[num] = i                  # ...then store

    return None                        # no pair adds up to target
```

Trace for `[2, 7, 11, 15]`, target 9: at `i=0`, 7 isn't in `{}`, so store
`{2: 0}`. At `i=1`, the complement is 2, which is in `seen`, so return `[0, 1]`.

O(n) time, one pass with O(1) average dictionary lookups. O(n) extra space.

## Key points
- complement = target - current number
- a dict (not a set): you need value → index, a set only remembers values
- check for the complement *before* storing the current number, so `[3, 3]`, target 6 doesn't pair an element with itself
- O(n) time, O(n) space, versus O(n²) for nested loops
- return something explicit when there's no pair

## Explanation
The common slip is reaching for a `set`. It gives O(1) membership checks, but
the problem asks for indices, and a set can't tell you where a value was. The
order of the two indices usually doesn't matter, so say so if asked. If the
array were **sorted**, two pointers would do it in O(1) extra space.
