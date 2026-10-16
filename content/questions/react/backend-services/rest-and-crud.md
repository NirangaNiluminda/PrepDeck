---
topic: react/backend-services
difficulty: medium
type: short-answer
tags: [react, rest, http, api, interview-favourite, mosh-react]
source: mosh-react-s08
---

## Question
What is a REST API? Map the CRUD operations to HTTP methods and URLs for a "posts" resource, and give the success status codes you'd expect.

## Answer
A **REST API** (*Representational State Transfer*) exposes **resources**
(posts, movies, users) at URLs called **endpoints**. Clients act on them with
standard **HTTP methods**, usually exchanging JSON.

| Operation | Method + URL | Body | Typical success |
|---|---|---|---|
| list | `GET /api/posts` | none | `200 OK` + array |
| read one | `GET /api/posts/42` | none | `200 OK` + object |
| **create** | `POST /api/posts` | the new post (no id) | **`201 Created`** + the created post, **with its new id** |
| replace | `PUT /api/posts/42` | the **whole** post | `200 OK` + the updated post |
| partial update | `PATCH /api/posts/42` | **only the changed fields** | `200 OK` |
| **delete** | `DELETE /api/posts/42` | none | `200 OK` or **`204 No Content`** |

The collection URL (`/posts`) is used for list and create; the **item URL**
(`/posts/:id`) for read, update and delete. Errors use **4xx** for client
problems (`400` bad request, `401` unauthenticated, `404` not found) and
**5xx** for server failures.

## Key points
- resources at endpoints, acted on with HTTP methods
- GET read, POST create, PUT replace, PATCH partial update, DELETE remove
- collection URL for list/create; item URL with id for the rest
- POST returns 201 plus the created resource with its id
- 4xx = client errors, 5xx = server errors
