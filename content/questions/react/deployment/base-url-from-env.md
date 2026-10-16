---
topic: react/deployment
difficulty: easy
type: code
tags: [react, deployment, http, axios, environment-variables, mosh-react]
source: mosh-react-s10
---

## Question
Every service builds URLs from a `config.json` `apiUrl`. Switch to an environment-specific API base URL, configured in a single place.

## Answer
Set the **base URL once on the HTTP client**, and let the services use
**relative paths**:

```js
// services/httpService.js
axios.defaults.baseURL = import.meta.env.VITE_API_URL;  // CRA: process.env.REACT_APP_API_URL
```

```js
// services/movieService.js: no config import, no host name
const apiEndpoint = '/movies';
export const getMovies = () => http.get(apiEndpoint);
export const getMovie = (id) => http.get(`${apiEndpoint}/${id}`);
```

```
# .env.development
VITE_API_URL=http://localhost:3900/api
# .env.production
VITE_API_URL=https://my-api.onrender.com/api
```

Delete `config.json`. Changing the API's address becomes an
environment-variable change, with no code edit. With an axios instance you'd
use `axios.create({ baseURL: … })` instead of the global defaults.

## Key points
- set baseURL once on the HTTP client from an env var
- services use relative endpoints (/movies)
- per-environment values in .env.development / .env.production
- no host names hard-coded in services
