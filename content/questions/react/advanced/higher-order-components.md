---
topic: react/advanced
difficulty: medium
type: code
tags: [react, hoc, patterns, reusability, mosh-react]
source: mosh-react-s11
---

## Question
What is a higher-order component? Write `withTooltip`, which gives any component a `showTooltip` prop that is `true` while the mouse is over it.

## Answer
A **higher-order component (HOC)** is a **function that takes a component and
returns a new component** with extra behaviour. The name comes from
higher-order functions. It lets several components share logic, here
"track hover state", without each one implementing it.

```jsx
// hoc/withTooltip.jsx: the course's version, as a class
function withTooltip(Component) {
  return class WithTooltip extends React.Component {
    state = { showTooltip: false };
    mouseOver = () => this.setState({ showTooltip: true });
    mouseOut = () => this.setState({ showTooltip: false });

    render() {
      return (
        <div onMouseOver={this.mouseOver} onMouseOut={this.mouseOut}>
          <Component {...this.props} showTooltip={this.state.showTooltip} />
        </div>
      );
    }
  };
}

// Movie.jsx
function Movie({ showTooltip }) {
  return <div>Movie{showTooltip && <div>Some tooltip</div>}</div>;
}
export default withTooltip(Movie);   // consumers render <Movie />, already enhanced
```

- By convention HOCs are named **`withSomething`**.
- The wrapper **forwards all props** (`{...this.props}`) and adds its own.
- Well-known HOCs: `React.memo`, Redux's `connect`, and React Router v4's
  `withRouter`.

## Key points
- HOC = function(Component) → new enhanced Component
- shares cross-cutting logic (hover, data, auth) between components
- named withX; forwards all props and injects new ones
- examples: React.memo, connect, withRouter
