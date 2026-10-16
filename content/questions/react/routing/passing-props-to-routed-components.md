---
topic: react/routing
difficulty: easy
type: mcq
tags: [react, routing, react-router, mosh-react]
source: mosh-react-s06
---

## Question
You want the Products route to render `<Products sortBy="newest" />`. Which is correct in React Router v6+?

## Options
- [ ] `<Route path="/products" component={Products} sortBy="newest" />`
- [ ] `<Route path="/products" component={<Products sortBy="newest" />} />`
- [x] `<Route path="/products" element={<Products sortBy="newest" />} />`
- [ ] `<Route path="/products" render={Products} props={{ sortBy: 'newest' }} />`

## Answer
**`element={<Products sortBy="newest" />}`**: you pass a real element, so
you write props exactly as you would anywhere else.

In **v4** that wasn't possible with `component={Products}`. You switched to
the `render` prop and forwarded the router's props by spreading them:
`render={props => <Products sortBy="newest" {...props} />}`. Without the
`{...props}`, `history`, `location` and `match` disappeared. v6 dropped
both `component` and `render`, and the route data comes from hooks instead.

## Key points
- v6+: element={<Comp anyProp="…" />}
- v4: render={props => <Comp {...props} extra />}
- v4's {...props} kept history/location/match; v6 uses hooks for those
