---
topic: javascript/es6
difficulty: medium
type: short-answer
tags: [javascript, es6, classes, oop, mosh-react]
source: mosh-react-s02
---

## Question
What problem do JavaScript classes solve? Explain `constructor`, `new` and `this` in a class, and what a class really is under the hood.

## Answer
If several objects need the same method, copying it into each object
literal duplicates the code, and a bug must then be fixed in every copy. A
**class** is a **blueprint**: you write the methods once, and every object
created from it shares them.

```js
class Person {
  constructor(name) {   // runs once per new object
    this.name = name;   // this = the object being created
  }
  walk() { console.log('walk'); } // shared by every Person
}

const person = new Person('Mosh'); // new creates the object and calls constructor
```

- class names use **PascalCase**
- `new` creates the object and runs `constructor` with your arguments
- inside class methods, `this` is the instance (when called as `person.walk()`)

Under the hood a class is **syntactic sugar over constructor functions and
prototypes**: `walk` lives on `Person.prototype`, and `typeof Person` is
`'function'`.

## Key points
- a class is a blueprint, so methods are written once and shared
- constructor initialises each new object; new creates it
- this refers to the instance
- classes are sugar over constructor functions and prototypes
