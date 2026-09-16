---
topic: security/crypto
difficulty: hard
type: short-answer
tags: [security, tls, cryptography]
source: starter-seed
---

## Question
Walk through a TLS 1.3 handshake. How does it prove the server's identity and agree on a shared key?

## Answer
1. **ClientHello**: the client sends its supported versions and cipher suites, a
   random value, and a *key share*: an ephemeral (EC)Diffie-Hellman public key
   for the group it expects the server to pick.
2. **ServerHello**: the server picks a cipher suite and replies with its own
   random value and key share. Both sides can now compute the same shared
   secret, derive handshake keys, and encrypt everything from here on.
3. **Server authentication**: the server sends its **Certificate** chain, then
   **CertificateVerify**, a signature over the handshake so far made with the
   certificate's private key, proving it holds that key. **Finished** carries a
   MAC over the whole handshake transcript.
4. **Client checks**: the client validates the chain up to a trusted root CA,
   checks the hostname and validity dates, verifies the signature and the
   Finished MAC, then sends its own Finished.

Application data then flows under keys derived from the shared secret.

Compared with TLS 1.2, the handshake takes one round trip instead of two, and
forward secrecy is guaranteed because static RSA key exchange was removed.
Session resumption can even send data in the first message (0-RTT), but that
data can be replayed, so only use it for idempotent requests.

## Key points
- ephemeral (EC)DHE key exchange gives forward secrecy
- certificate chain to a trusted CA plus CertificateVerify proves identity
- Finished MACs protect the integrity of the whole handshake
- 1-RTT in TLS 1.3 versus 2-RTT in TLS 1.2
- 0-RTT resumption is replayable
