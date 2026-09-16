---
topic: devops/ci-cd
difficulty: easy
type: short-answer
tags: [ci-cd, release-engineering]
source: starter-seed
---

## Question
What is the difference between continuous integration, continuous delivery and continuous deployment?

## Answer
**Continuous integration**: developers merge small changes into the main branch
often, and every merge triggers an automated build and test run, so integration
problems show up within minutes rather than at release time.

**Continuous delivery**: every change that passes the pipeline becomes a release
candidate that could go to production at any moment. Actually releasing it is a
manual, usually one-click, decision.

**Continuous deployment**: every change that passes the pipeline goes to
production automatically, with no human approval step.

Continuous deployment only works with a trustworthy test suite, good monitoring
and a fast way back: feature flags, canary releases or quick rollbacks.

## Key points
- CI: frequent merges, automated build and tests on every change
- continuous delivery: always releasable, release is a manual decision
- continuous deployment: passing changes release automatically
- automatic release needs strong tests, observability and fast rollback
