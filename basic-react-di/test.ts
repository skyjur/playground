import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { Container, inject, Provider } from "./index";
import { expect } from "chai";

describe('Dependency injection with React', () => {
    class Child extends React.Component {
        @inject('x') val: number;
        render() { return 'x is: ' + this.val; }
    }

    it.only('Should inject value', () => {
        let container = new Container;
        container.constant('x', 1);
        let r = TestRenderer.create(React.createElement(Provider, {container}, React.createElement(Child, {})));
        expect(r.toJSON()).to.eq('x is: 1');
    });

    it.only('Should throw error about missing context', () => {
        let r = () => TestRenderer.create(React.createElement(Child, {}));
        expect(r).to.throw('Context should have dependency container in key "container"');
    });

    it.only('Should throw error about missing service', () => {
        let container = new Container;
        let r = () => TestRenderer.create(React.createElement(Provider, {container}, React.createElement(Child, {})));
        expect(r).to.throw('Service "x" is not registered');
    });
});
