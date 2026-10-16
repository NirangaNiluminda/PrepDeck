---
topic: react/forms
difficulty: medium
type: short-answer
tags: [react, forms, hooks, composition, interview-favourite, mosh-react]
source: mosh-react-s07
---

## Question
Login, Register and Movie forms all need the same plumbing: `data` + `errors` state, `handleChange`, `handleSubmit` with validation, and rendering inputs and a submit button. The course extracts a `Form` base class that each form `extends`. How would you share this logic in modern React, and why?

## Answer
**Course (class inheritance):** `class LoginForm extends Form`. The base
class holds the shared `state = { data: {}, errors: {} }`, `validate`,
`validateProperty`, `handleChange`, `handleSubmit` (which calls the
subclass's `doSubmit()`), and helpers such as `renderInput(name, label,
type)` and `renderButton(label)`. Each form supplies only a `schema`,
`doSubmit` and `render`. The useful convention was that every form calls its
fields **`data`**, so the shared code never needs to know about "account" or
"movie".

**Today: composition, not inheritance.** The React docs explicitly favour
composition, and hooks made it easy. Put the shared logic in a **custom
hook**:

```jsx
function useForm(schema, initialData, onSubmit) {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const handleChange = /* validate the field, update data and errors */;
  const handleSubmit = /* preventDefault, validate all, onSubmit(data) */;
  return { data, errors, handleChange, handleSubmit };
}

function LoginForm() {
  const { data, errors, handleChange, handleSubmit } =
    useForm(loginSchema, { username: '', password: '' }, login);
  return <form onSubmit={handleSubmit}>{/* <Input … /> fields */}</form>;
}
```

In practice most teams use **React Hook Form** with a Zod resolver
(`useForm({ resolver: zodResolver(schema) })`), which provides all of this
plus performance and accessibility details.

## Key points
- course: a Form base class with shared state and handlers; forms extend it
- convention: every form's state is data + errors
- modern React: composition and custom hooks, not inheritance
- in practice: React Hook Form + Zod resolver
