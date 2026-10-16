---
topic: react/composing-components
difficulty: medium
type: short-answer
tags: [react, props, state, interview-favourite, mosh-react]
source: mosh-react-s04
---

## Question
What's the difference between props and state? Can a component change its own props?

## Answer
| | Props | State |
|---|---|---|
| What it is | data **given to** a component by its parent (its input) | data **owned by** the component, private and internal |
| Who changes it | only the parent, by passing new props | only the component itself, via its setter / `setState` |
| Visible to others | yes, the parent decides it | no, other components can't read it |

**Props are read-only.** Assigning `props.value = 0` throws, e.g.
*"Cannot assign to read only property 'value'"*. A component must never
modify its input.

If data needs to **change over time**, it has to live in **state**
somewhere. Usually that's in the component that owns it, which passes it
down as props and receives change requests back as events. Some components
have no state at all and get everything through props.

## Key points
- props: input from the parent, read-only inside the component
- state: private data the component owns and can change
- a component never modifies its own props
- changing data lives in someone's state and flows down as props
