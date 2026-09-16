---
topic: dsa/sliding-window
difficulty: medium
type: code
tags: [dsa, sliding-window, strings, hash-map]
source: starter-seed
---

## Question
Return the length of the longest substring without repeating characters. For `"abcabcbb"` the answer is 3 (`"abc"`).

## Answer
Keep a window `[left, right]` that never contains a repeat, and remember the last
index where each character appeared. When the character at `right` was last seen
*inside* the window, jump `left` to just past that position rather than shrinking
one step at a time.

```ts
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const seenAt = lastSeen.get(s[right]);
    if (seenAt !== undefined && seenAt >= left) left = seenAt + 1;
    lastSeen.set(s[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```

O(n) time: each index enters the window once and `left` only moves forward.
Space is O(min(n, alphabet size)).

## Key points
- the window always holds unique characters
- jump left past the previous occurrence instead of shrinking step by step
- ignore last-seen positions that are already outside the window
- O(n) time
