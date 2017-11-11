# Simple dependency injection with React

```tsx
const ServiceX = 'x';

class MyComponent extends React.Component() {
    @inject(ServiceX) val: number;

    render() {
        return 'ServiceX value is: ' + this.val;
    }
}

let container = new Container;
container.constant('x', 1);

ReactDOM.render(
    <Provider container={container}>
        <MyComponent />
    </Provider>,
    document.getElementById('root')
);
```