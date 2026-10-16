---
topic: react/advanced
difficulty: medium
type: code
tags: [react, context, state, mosh-react]
source: mosh-react-s11
---

## Question
A `Login` button deep in the tree must log the user in, so that every component reading the user context updates. Context values are read-only to consumers; how do you let them update it?

## Answer
Keep the data in **state in the provider component**, and put **a function
that updates it** into the context value alongside the data:

```jsx
function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoggedIn = (username) => {
    // in a real app: call the API first
    setCurrentUser({ name: 'Mosh' });
  };

  return (
    <UserContext.Provider value={{ currentUser, onLoggedIn: handleLoggedIn }}>
      <MoviePage />
      <Login />
    </UserContext.Provider>
  );
}

function Login() {
  const { onLoggedIn } = useContext(UserContext);
  return <button onClick={() => onLoggedIn('username')}>Login</button>;
}
```

It's the same **"data down, events up"** idea as props: consumers call
`onLoggedIn`, the provider updates its state, the new `value` flows down, and
every consumer of `UserContext` re-renders with the new user.

## Key points
- the provider holds the data in state
- put the updater function in the context value
- consumers call it; the provider's state changes; consumers re-render
- data down, events up, just like props
