---
topic: react/pagination-filtering-sorting
difficulty: medium
type: short-answer
tags: [react, proptypes, typescript, type-checking, mosh-react]
source: mosh-react-s05
---

## Question
A caller passes `itemsCount="abc"` to `Pagination`. It silently renders one page, with no error. How do PropTypes catch this, and what do teams use instead today?

## Answer
**PropTypes** is a separate package (`prop-types`, split out of React in
v15.5) that **checks props at run time, in development**, and logs a
console warning when one is the wrong type or missing:

```jsx
import PropTypes from 'prop-types';

Pagination.propTypes = {
  itemsCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
// "Failed prop type: Invalid prop `itemsCount` of type `string`, expected `number`."
```

Benefits: bugs show up immediately instead of as odd behaviour, and the
declaration **documents** the component's interface. Note the spelling:
`propTypes` on the component, `PropTypes` for the import. The checks are
**stripped from production builds**.

**Today: TypeScript.** Prop types are checked **at compile time** in your
editor, before the code even runs, and React 19 no longer checks
`propTypes` at all:

```tsx
interface PaginationProps {
  itemsCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}
```

## Key points
- PropTypes: run-time, development-only prop checking with warnings
- isRequired flags missing props; declarations double as docs
- stripped in production builds
- today: TypeScript interfaces check props at compile time
- React 19 ignores propTypes
