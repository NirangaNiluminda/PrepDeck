---
topic: web/networking
difficulty: medium
type: short-answer
tags: [dns, tcp, tls, http, interview-favourite]
source: starter-seed
---

## Question
What happens, step by step, when you type `https://example.com` into a browser and press Enter?

## Answer
1. **URL handling.** The browser parses the URL and checks its HSTS list, so
   `http` would be upgraded to `https`.
2. **DNS.** It looks for the IP in the browser cache, then the OS cache, then
   asks a resolver, which may walk from the root servers to the `.com` servers
   to the domain's authoritative name servers.
3. **TCP.** A three-way handshake (SYN, SYN-ACK, ACK) opens a connection to port 443.
4. **TLS.** Client and server agree on a protocol version and cipher, the server
   presents a certificate that the browser verifies against trusted CAs, and
   they derive session keys.
5. **HTTP request.** The browser sends `GET /` with headers and cookies.
6. **Server side.** The request passes through load balancers or reverse
   proxies to an application server, which may hit caches and databases before
   responding.
7. **Rendering.** The browser parses the HTML into the DOM, fetches CSS, scripts
   and images (reusing connections, multiplexed over HTTP/2), builds the CSSOM,
   runs JavaScript, then lays out and paints the page.

With HTTP/3, QUIC over UDP replaces the separate TCP and TLS handshakes.

## Key points
- DNS resolution through several caching layers
- TCP and TLS handshakes happen before any HTTP is sent
- the request passes load balancers or proxies before reaching the app
- rendering: DOM, CSSOM, JavaScript, layout, paint
