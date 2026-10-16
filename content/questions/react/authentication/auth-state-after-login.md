---
topic: react/authentication
difficulty: medium
type: short-answer
tags: [react, authentication, state, context, mosh-react]
source: mosh-react-s09
---

## Question
`App` reads the current user once, when it mounts, and passes it to the navbar. After logging in and navigating to `/`, the navbar still shows "Login / Register" until you refresh. The course "fixes" this with `window.location = '/'`. Why does the bug happen, and what's the better fix?

## Answer
`App` mounts **once**. It read the user (none) at mount and never again.
Logging in changed `localStorage`, but **React doesn't watch localStorage**,
and client-side navigation re-renders without remounting `App`. So its state
still says "no user".

**Course fix:** `window.location = '/'` forces a **full page reload**. `App`
mounts again, reads the token, and finds the user. It works, but it throws
away all in-memory state, reloads the bundle, and flashes the page.

**Better fix: treat the current user as React state that login and logout
update.** Hold it in an **auth Context** (or a store) near the top of the app,
and have `login`/`logout` set it:

```jsx
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getCurrentUser());
  const login = async (email, password) => {
    await auth.login(email, password);
    setUser(auth.getCurrentUser());   // update state, and every consumer re-renders
  };
  const logout = () => { auth.logout(); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// anywhere: const { user } = useContext(AuthContext);
```

The navbar updates instantly, there's no reload, and you no longer need to
pass `user` as a prop through every layer (prop drilling).

## Key points
- App read the user only on mount; React doesn't observe localStorage
- window.location reload works but discards all state
- better: keep the user in state/Context, and update it in login/logout
- Context also removes prop drilling of the user
