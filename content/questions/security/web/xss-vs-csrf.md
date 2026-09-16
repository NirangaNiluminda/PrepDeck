---
topic: security/web
difficulty: medium
type: short-answer
tags: [security, xss, csrf, owasp, interview-favourite]
source: starter-seed
---

## Question
What is the difference between XSS and CSRF, and how do you defend against each?

## Answer
**XSS (cross-site scripting)**: an attacker gets their JavaScript to run inside
your pages, in a victim's browser, with your site's privileges. It can be stored
(saved in your database), reflected (echoed from the URL) or DOM-based. The
script can read the page, act as the user, and steal any token JavaScript can reach.

*Defences*: encode output for the context it appears in (React escapes by
default, so avoid `dangerouslySetInnerHTML` with untrusted data), sanitise any
HTML you must render, add a Content-Security-Policy, and keep session cookies
`HttpOnly`.

**CSRF (cross-site request forgery)**: a malicious site makes the victim's
browser send a request to your site. The browser attaches the victim's cookies
automatically, so a state-changing request succeeds without the user intending
it. The attacker can't read the response; they only need the side effect.

*Defences*: `SameSite=Lax` or `Strict` cookies, anti-CSRF tokens, checking the
`Origin` header, and never changing state on a GET.

In short, XSS abuses the user's trust in your site, while CSRF abuses your
site's trust in the user's browser. XSS also defeats CSRF protection, because
injected script can read the token.

## Key points
- XSS: attacker's script runs in your origin
- CSRF: forged requests ride on the victim's cookies
- XSS defences: output encoding, sanitising, CSP, HttpOnly cookies
- CSRF defences: SameSite cookies, CSRF tokens, Origin checks, no state change on GET
- XSS defeats CSRF tokens
