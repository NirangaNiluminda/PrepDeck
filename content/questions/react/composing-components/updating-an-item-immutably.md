---
topic: react/composing-components
difficulty: medium
type: mcq
tags: [react, state, immutability, interview-favourite, mosh-react]
source: mosh-react-s04
---

## Question
Which `handleIncrement(counter)` updates state **without mutating** the existing state?

## Options
- [ ] `const next = [...counters]; next[counters.indexOf(counter)].value++; setCounters(next);`
- [ ] `counter.value++; setCounters(counters);`
- [x] `setCounters(counters.map(c => c.id === counter.id ? { ...c, value: c.value + 1 } : c));`
- [ ] `counters.splice(counters.indexOf(counter), 1, { ...counter, value: counter.value + 1 }); setCounters(counters);`

## Answer
**The `map` version.** It builds a new array and a **new object** for the
one counter that changed, and reuses the others untouched.

The first option is a classic trap that the course demonstrates: **`[...counters]`
copies only the array**. The objects inside are the same ones still in state,
so `next[i].value++` mutates state directly. You must also clone the object
you change, e.g. `next[i] = { ...next[i], value: next[i].value + 1 }`.

The second mutates the object and passes the *same* array, so React sees no
change. The fourth mutates the state array in place with `splice`.

## Key points
- spread is shallow: copying the array doesn't copy its objects
- clone every object you change, at every level
- map + spread = new array plus a new object for the changed item
- never mutate and then set the same reference
