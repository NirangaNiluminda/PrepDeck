---
topic: react/forms
difficulty: easy
type: code
tags: [react, forms, javascript, mosh-react]
source: mosh-react-s07
---

## Question
A login form has `username` and `password` fields stored in one state object. Write a single `handleChange` that works for both, and for any field added later.

## Answer
Give each input a **`name`** that matches its key in state, then use a
**computed property name** to update the right key:

```jsx
const [data, setData] = useState({ username: '', password: '' });

const handleChange = ({ currentTarget: input }) =>
  setData(prev => ({ ...prev, [input.name]: input.value }));

<input name="username" value={data.username} onChange={handleChange} />
<input name="password" type="password" value={data.password} onChange={handleChange} />
```

- `[input.name]` (bracket / computed key) chooses the property **at run
  time**, so one handler serves every field.
- `{ ...prev, … }` copies the other fields, because state is replaced, not
  merged, with hooks.
- Destructuring the event, `({ currentTarget: input })`, avoids repeating
  `e.currentTarget`. `currentTarget` is the element the handler is attached
  to; `target` would also work here.

## Key points
- name each input after its key in state
- one handler: { ...prev, [input.name]: input.value }
- computed keys pick the property at run time
- spread the previous object, since hooks don't merge
