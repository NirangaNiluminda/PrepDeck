---
topic: web/networking
difficulty: easy
type: short-answer
tags: [tcp, udp, networking]
source: starter-seed
---

## Question
What are the main differences between TCP and UDP, and when would you choose UDP?

## Answer
**TCP** is connection-oriented. A handshake sets up the connection, and sequence
numbers, acknowledgements and retransmission guarantee that data arrives
complete and in order. Flow control and congestion control stop it overwhelming
the receiver or the network. The price is latency and overhead, plus
head-of-line blocking: one lost packet stalls everything behind it.

**UDP** is connectionless. It sends independent datagrams with no guarantee of
delivery, ordering or de-duplication, and its header is 8 bytes against TCP's 20
or more.

Choose UDP when a late packet is worthless or the application handles
reliability itself: live voice and video, online games, DNS lookups, and QUIC
(the transport under HTTP/3).

## Key points
- TCP: connection, reliable ordered delivery, flow and congestion control
- UDP: connectionless datagrams, no delivery or ordering guarantees
- TCP suffers head-of-line blocking; UDP has lower latency and overhead
- UDP for real-time media, games, DNS, and QUIC
