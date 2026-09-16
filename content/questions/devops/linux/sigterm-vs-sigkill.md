---
topic: devops/linux
difficulty: medium
type: short-answer
tags: [linux, signals, graceful-shutdown]
source: starter-seed
---

## Question
What is the difference between `kill <pid>` and `kill -9 <pid>`?

## Answer
`kill <pid>` sends **SIGTERM** (signal 15), a request to terminate. The process
can catch it and shut down cleanly: finish in-flight requests, flush buffers,
close connections, remove temp files. It can also ignore it.

`kill -9 <pid>` sends **SIGKILL**, which cannot be caught, blocked or ignored.
The kernel stops the process immediately with no cleanup, which can leave
partially written data, stale lock files or orphaned child processes.

The safe pattern is SIGTERM first, wait a grace period, then SIGKILL if the
process is still running. That is what `docker stop` does (10 seconds by
default) and what Kubernetes does when deleting a pod (30 seconds by default).

## Key points
- SIGTERM can be handled, allowing a graceful shutdown
- SIGKILL cannot be caught or ignored and skips all cleanup
- send SIGTERM, wait, then SIGKILL
- `docker stop` and Kubernetes follow this pattern
