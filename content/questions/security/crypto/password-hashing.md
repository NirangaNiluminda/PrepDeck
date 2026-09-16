---
topic: security/crypto
difficulty: medium
type: short-answer
tags: [security, hashing, passwords]
source: starter-seed
---

## Question
How should an application store user passwords? Explain hashing and salting.

## Answer
Never store passwords in plain text or with reversible encryption. Store the
output of a **slow, adaptive password-hashing function**: Argon2id is the current
recommendation; bcrypt, scrypt, or PBKDF2 with a high iteration count are
acceptable.

General-purpose hashes like SHA-256 or MD5 are the wrong tool because they are
*fast*: attackers with GPUs can try billions of guesses per second against a
leaked database. Password hashes are deliberately expensive, with a tunable cost
you raise as hardware improves.

A **salt** is a unique random value generated for each password and stored next
to its hash. It makes identical passwords produce different hashes, which
defeats precomputed rainbow tables and forces attackers to crack each hash
separately. Salts aren't secret, and modern algorithms generate and embed them
for you. A **pepper** is an optional extra secret kept outside the database,
for example in a key management service.

When you raise the cost factor, rehash each password the next time its user
signs in.

## Key points
- use Argon2id, bcrypt or scrypt, not SHA-256 or MD5
- fast hashes are cheap to brute-force
- unique random salt per password defeats rainbow tables
- salts are not secret; a pepper is kept outside the database
- raise the cost over time and rehash on login
