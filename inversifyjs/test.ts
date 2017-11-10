import "reflect-metadata";
import {Container, injectable, inject} from 'inversify';
import { expect } from "chai";
import * as React from "react";
import * as TestRenderer from 'react-test-renderer';
import { Provider, resolve } from "inversify-react";

const C = Symbol('C');

@injectable()
class Y {
    @inject(C) c: any;
    constructor() {}
}

class XY {
    
}

@injectable()
class X {
    static nextId = 1;
    id: number;
    @inject(C) c: any;
    @inject(Y) y: Y;
    constructor() { this.id = X.nextId++; }
}

describe('test inversify', () => {
    let c1 = new Container;
    c1.bind(C).toConstantValue('c1');
    c1.bind(Y).toSelf();
    c1.bind(X).toSelf().inSingletonScope();
    let c2 = new Container;
    c2.bind(C).toConstantValue('c2');
    c2.bind(Y).toSelf();
    c2.bind(X).toSelf();

    it('Basic resolver api', () => {
        expect(c1.get(X).c).eq('c1');
        expect(c2.get(X).c).eq('c2');
        expect(c1.get(X).y.c).eq('c1');
        expect(c2.get(X).y.c).eq('c2');
    });

    it('Resolver with singleton mode', () => {
        expect(c1.get(X) === c1.get(X)).to.be.true; // singleton mode
        expect(c2.get(X) === c2.get(X)).to.be.false;
        expect(c1.get(X).id === c1.get(X).id).to.be.true; // singleton mode
        expect(c2.get(X).id + 1 === c2.get(X).id).to.be.true;
    });

    class SingleChildParent extends React.Component {
        render() { return React.createElement(Child, {}); }
    }

    class TwoChildParent extends React.Component {
        render() { 
            return [
                React.createElement(Child, {}),
                React.createElement(Child, {})
            ];
        }
    }

    class Child extends React.Component {
        @resolve
        private readonly x: X;

        render() {
            return JSON.stringify(this.x);
        }
    }

    it('Basic react resolver with Provider', ()=>{
        let c1_x_id = c1.get(X).id;
        let c2_x_id = X.nextId;
        let r1 = TestRenderer.create(React.createElement(Provider, {container: c1}, React.createElement(SingleChildParent, {})));
        let r2 = TestRenderer.create(React.createElement(Provider, {container: c2}, React.createElement(SingleChildParent, {})));
        expect(r1.toJSON()).to.eq(`{"id":${c1_x_id},"c":"c1","y":{"c":"c1"}}`);
        expect(r2.toJSON()).to.eq(`{"id":${c2_x_id},"c":"c2","y":{"c":"c2"}}`);
    });

    it('Missing dependencies error', ()=>{
        let c3 = new Container;
        let f = () => TestRenderer.create(React.createElement(Provider, {container: c3}, React.createElement(SingleChildParent, {})));
        expect(f).to.throw('No matching bindings found for serviceIdentifier: X');
    });

    it('non-singleton X instances should be different in different react nodes', ()=>{
        let x_id1 = X.nextId;
        let x_id2 = X.nextId + 1;
        let r = TestRenderer.create(React.createElement(Provider, {container: c2}, React.createElement(TwoChildParent, {})));
        expect(r.toJSON()).to.deep.eq([
            `{"id":${x_id1},"c":"c2","y":{"c":"c2"}}`,
            `{"id":${x_id2},"c":"c2","y":{"c":"c2"}}`
        ]);
    });
});

describe('react context', () => {
    it('Context passing to descendants', () => {
        class Root extends React.Component {
            static childContextTypes = {
                contextAvailable: f=>null
            };
            getChildContext() {
                return {'contextAvailable': 1}
            }
            render() {
                return React.createElement(Child, {});
            }
        }
        class Child extends React.Component {
            render() {
                return React.createElement(Descendant, {});
            }
        }
        class Descendant extends React.Component {
            static contextTypes = {
                contextAvailable: f=>null
            }
            context: any;
            render(){
                return `Context: ${JSON.stringify(this.context)}`
            }
        }
        let r = TestRenderer.create(
            React.createElement(Root, {})
        );
        let t = r.toJSON();
        expect(t).eq('Context: {"contextAvailable":1}');
    });
});
