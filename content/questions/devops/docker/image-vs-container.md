---
topic: devops/docker
difficulty: easy
type: short-answer
tags: [docker, containers]
source: starter-seed
---

## Question
What is the difference between a Docker image and a container?

## Answer
An **image** is a read-only template made of stacked filesystem layers plus
metadata such as the entrypoint, environment variables and exposed ports. It is
built from a Dockerfile and stored in a registry.

A **container** is an instance of an image. Docker adds a thin writable layer on
top of the image's layers and runs the process in isolated Linux namespaces,
with cgroups limiting its CPU and memory.

Many containers can run from one image. Anything a container writes to its own
filesystem disappears when the container is removed, unless it was written to a
volume.

## Key points
- image: immutable, layered template
- container: running instance with its own writable layer
- one image, many containers
- container filesystem changes are ephemeral; use volumes to persist data
- isolation comes from namespaces and cgroups, not a virtual machine
