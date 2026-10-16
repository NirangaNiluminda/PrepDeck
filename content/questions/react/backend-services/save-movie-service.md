---
topic: react/backend-services
difficulty: medium
type: code
tags: [react, http, services, rest, mosh-react]
source: mosh-react-s08
---

## Question
Write `movieService` functions for getting, saving and deleting movies. `saveMovie` must create (POST) a movie without an `_id` and update (PUT) one that has an `_id`, and the API rejects bodies that contain `_id`. Also: why does `getMovie` for an unknown id need different handling than it did with the fake service?

## Answer
```js
// services/movieService.js
import http from './httpService';
import { apiUrl } from '../config.json';

const apiEndpoint = `${apiUrl}/movies`;

function movieUrl(id) {              // not exported: an implementation detail
  return `${apiEndpoint}/${id}`;
}

export const getMovies = () => http.get(apiEndpoint);
export const getMovie = (id) => http.get(movieUrl(id));
export const deleteMovie = (id) => http.delete(movieUrl(id));

export function saveMovie(movie) {
  if (movie._id) {
    const body = { ...movie };       // clone: the caller's object is React state
    delete body._id;                 // the id belongs in the URL, not the body
    return http.put(movieUrl(movie._id), body);
  }
  return http.post(apiEndpoint, movie);
}
```

- **Create or update** is decided by whether `_id` exists. Sending the id
  both in the URL and in the body is ambiguous, so APIs often reject it.
- **Clone before deleting**: the movie passed in is part of the form's
  state, and mutating it would corrupt that state.
- **Unknown id:** the fake service returned `null`; the real one **throws**
  (axios rejects on 404). The form must use
  `try { … } catch (ex) { if (ex.response?.status === 404) navigate('/not-found', { replace: true }); }`.
- Keep `componentDidMount`/effects readable by splitting them into named
  steps: `await populateGenres(); await populateMovie();`.

## Key points
- one URL helper; keep it private to the module
- save: PUT movieUrl(id) when _id exists, otherwise POST the collection
- strip _id from the body on a clone, never on state
- a real API throws on 404; catch it and redirect to not-found
- split loading into named steps (populateGenres, populateMovie)
