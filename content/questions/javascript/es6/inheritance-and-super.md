---
topic: javascript/es6
difficulty: medium
type: mcq
tags: [javascript, es6, classes, inheritance, mosh-react]
source: mosh-react-s02
---

## Question
`class Teacher extends Person` adds its own `constructor(name, degree)` but never calls `super(name)`. What happens when you run `new Teacher('Mosh', 'MSc')`?

## Options
- [ ] It works; `name` is simply left `undefined`
- [ ] It works, and `Person`'s constructor is called automatically with the same arguments
- [x] It throws a `ReferenceError`: a derived class must call `super()` before using `this` or returning
- [ ] `degree` is ignored because `Person`'s constructor runs instead

## Answer
It **throws**, with a message like *"Must call super constructor in derived
class before accessing 'this' or returning from derived constructor"*
(older tooling: *"Missing super call in constructor"*). A subclass with its
own constructor must call **`super(...)`**, the parent's constructor,
**before** touching `this`:

```js
class Teacher extends Person {
  constructor(name, degree) {
    super(name);           // Person sets this.name
    this.degree = degree;
  }
  teach() {}
}
```

Without a custom constructor, `extends` passes the arguments to the parent
automatically. Old React class components followed exactly this pattern:
`class App extends React.Component` with `super(props)`. Today, function
components avoid classes entirely.

## Key points
- extends inherits the parent's methods and constructor
- a custom constructor in a subclass must call super(...) first
- super(...) runs the parent's constructor
- old React: class X extends React.Component, constructor calls super(props)
