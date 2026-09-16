---
topic: devops/docker/networking
difficulty: medium
type: short-answer
tags: [docker, networking, dns]
source: starter-seed
---

## Question
Two containers need to talk to each other. How does one find the other, and when do you need to publish ports with `-p`?

## Answer
Put both containers on the same **user-defined bridge network**. Docker runs an
embedded DNS server on those networks that resolves container names and network
aliases to container IPs, so an app container can reach its database at
`db:5432`.

The default `bridge` network does **not** provide name resolution. Containers on
it can only reach each other by IP, which changes on restart.

Publishing a port (`-p 8080:80`) maps a host port to a container port. It is only
needed for traffic from the host or outside the machine. Containers on the same
network talk to each other on the container port directly, with nothing
published.

## Key points
- user-defined bridge networks resolve containers by name
- the default bridge network has no name-based discovery
- `-p` exposes a container port on the host; not needed between containers
- Docker Compose creates a network per project, so service names resolve

## References
- https://docs.docker.com/engine/network/drivers/bridge/
