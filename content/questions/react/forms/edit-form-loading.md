---
topic: react/forms
difficulty: medium
type: code
tags: [react, forms, routing, data-fetching, mosh-react]
source: mosh-react-s07
---

## Question
`/movies/new` shows an empty movie form, and `/movies/:id` shows the same form filled with that movie. An unknown id should go to Not Found. The API returns `{ _id, title, genre: { _id, name }, … }` but the form edits `genreId`. Implement the loading logic.

## Answer
```jsx
function MovieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ title: '', genreId: '', numberInStock: '', dailyRentalRate: '' });

  useEffect(() => {
    if (id === 'new') return;                      // nothing to load
    const movie = getMovie(id);
    if (!movie) {
      navigate('/not-found', { replace: true });   // replace, not push
      return;                                      // a redirect doesn't stop this code
    }
    setData(mapToViewModel(movie));
  }, [id, navigate]);
  /* … */
}

function mapToViewModel(movie) {
  return {
    _id: movie._id,
    title: movie.title,
    genreId: movie.genre._id,      // the form needs the id only
    numberInStock: movie.numberInStock,
    dailyRentalRate: movie.dailyRentalRate,
  };
}
```

- **`replace`**: with push, Back would return to the bad URL and redirect
  again, trapping the user in a loop.
- **`return` after redirecting**: navigating doesn't abort the function, so
  without it the code carries on running.
- A **view model**: APIs are general-purpose and return nested data for many
  pages. Map it to exactly the shape **this form** edits (`genreId`, not a
  `genre` object), and map back when saving.

## Key points
- one form for new and edit: skip loading when the id is "new"
- unknown id: navigate to not-found with replace, then return
- map the API model to a view model shaped for the form
- the genre select works with genreId, not the genre object
