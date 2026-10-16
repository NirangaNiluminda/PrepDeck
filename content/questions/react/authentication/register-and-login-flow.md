---
topic: react/authentication
difficulty: medium
type: code
tags: [react, authentication, forms, http, mosh-react]
source: mosh-react-s09
---

## Question
Wire up a register form and a login form to a backend: `POST /api/users` creates a user (`400` "User already registered" if taken), and `POST /api/auth` with `{ email, password }` returns a JSON Web Token (`400` for a bad email/password). The form's field is called `username`, but the API expects `email`. Show the services and how the forms surface server errors.

## Answer
```js
// services/userService.js
export function register(user) {
  return http.post(`${apiUrl}/users`, {
    email: user.username,          // map the form's names to the API's names
    password: user.password,
    name: user.name,
  });
}

// services/authService.js
export async function login(email, password) {
  const { data: jwt } = await http.post(`${apiUrl}/auth`, { email, password });
  localStorage.setItem(tokenKey, jwt);   // the course's choice; see the storage question
}
```

```jsx
// in the login form's submit handler
try {
  await auth.login(data.username, data.password);
  navigate('/');
} catch (ex) {
  if (ex.response?.status === 400) {
    setErrors({ ...errors, username: ex.response.data }); // show the server's message on the field
  }
}
```

- **Map names in the service.** Front end and back end often disagree on
  names (`username` vs `email`); fix that in one place, not across the UI.
  Better still, agree on the same names.
- A **400** is an **expected** error, so show it on the form. Anything else is
  left to the global HTTP interceptor.
- The response never contains the password. The server returns the user (id,
  name, email), or a token.

## Key points
- one service per endpoint group: userService.register, authService.login
- map form field names to API names inside the service
- 400 from the server = expected error, so show its message on the field
- login exchanges credentials for a JWT
