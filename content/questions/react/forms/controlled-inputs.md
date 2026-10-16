---
topic: react/forms
difficulty: medium
type: short-answer
tags: [react, forms, controlled-components, interview-favourite, mosh-react]
source: mosh-react-s07
---

## Question
What's the difference between a controlled and an uncontrolled input? Show a controlled one, and say when you'd pick each.

## Answer
A form input **keeps its own state in the DOM** by default.

**Controlled input:** React state is the **single source of truth**. The
input displays `value` from state, and every keystroke goes through
`onChange` into state:

```jsx
const [username, setUsername] = useState('');
<input value={username} onChange={e => setUsername(e.target.value)} />
```

You always have the current value, so you can validate as the user types,
format input, disable buttons, or reset the form, just by changing state.

**Uncontrolled input:** the DOM holds the value. You give it a starting
value with `defaultValue` and read it when needed, through a ref or from
`new FormData(form)` on submit:

```jsx
<input name="username" defaultValue="" />
```

**Pick controlled** when the UI must react to the value as it changes
(live validation, dependent fields). **Pick uncontrolled** for simple forms
read only on submit, for file inputs (which are always uncontrolled), or for
performance on very large forms. **React Hook Form** uses uncontrolled inputs
under the hood for that reason.

## Key points
- controlled: value from state + onChange; React is the source of truth
- uncontrolled: the DOM holds the value; defaultValue, refs or FormData
- controlled enables live validation, formatting and reset
- uncontrolled suits simple forms, file inputs, and big forms
