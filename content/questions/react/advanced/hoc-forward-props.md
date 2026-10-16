---
topic: react/advanced
difficulty: easy
type: mcq
tags: [react, hoc, props, mosh-react]
source: mosh-react-s11
---

## Question
A HOC renders `<Component showTooltip={this.state.showTooltip} />` without `{...this.props}`. Someone uses the enhanced component as `<Movie id={42} title="Up" />`. What does the inner `Movie` receive?

## Options
- [ ] `id`, `title` and `showTooltip`
- [x] Only `showTooltip`; `id` and `title` are lost at the wrapper
- [ ] Nothing at all
- [ ] React merges them in automatically

## Answer
**Only `showTooltip`.** Props passed to the enhanced component go to the
**wrapper**, the class the HOC returned. They reach the inner component only
if the wrapper passes them on. That's why every HOC should spread them:
`<Component {...this.props} showTooltip={…} />`. Forgetting this is the most
common HOC bug, and it's one reason custom hooks, which have no wrapper
layer, are usually preferred today.

## Key points
- props go to the outer wrapper first
- the HOC must forward them with {...props}
- then add its own injected props
