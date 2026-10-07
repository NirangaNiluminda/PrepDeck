---
topic: dsa/complexity
difficulty: easy
type: short-answer
tags: [dsa, complexity, big-o, data-structures]
source: prep-chat-day1
---

## Question
Give the typical time complexity of access, search, insert and delete for an array, a linked list, a hash map and a balanced binary search tree, and say when you'd use each.

## Answer
| Structure | Access | Search | Insert | Delete | Use it for |
|---|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) | fast lookup by index, fixed or rarely changing size |
| Linked list | O(n) | O(n) | O(1)* | O(1)* | frequent insert/delete when you already hold the node |
| Hash map | — | O(1) avg | O(1) avg | O(1) avg | fast lookup by key |
| Balanced BST | O(log n) | O(log n) | O(log n) | O(log n) | ordered data, range queries |

\* O(1) only when you already have a pointer to the position; finding it is O(n).

Stacks (LIFO: undo, parsing, DFS) and queues (FIFO: BFS, task scheduling) both
push and pop in O(1). A graph traversal visits every vertex and edge, O(V + E).

## Key points
- arrays: O(1) index access, O(n) insert/delete because elements shift
- linked lists: O(1) insert/delete at a known node, O(n) to find it
- hash maps: O(1) average lookup, degrading to O(n) with many collisions
- balanced BSTs: O(log n) everything, and they keep keys ordered
- stack = LIFO, queue = FIFO, both O(1) push/pop
