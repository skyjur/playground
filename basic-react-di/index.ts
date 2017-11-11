import { Component, Children } from "react";

const containerKey = 'container';

interface ServiceResolver {
    get(serviceIdentifier: string): any;
}

export class Container implements ServiceResolver {
    private factories: {[serviceIdentifier: string]: ()=>any} = {};

    constant(serviceIdentifier: string, value: any) {
        this.factories[serviceIdentifier] = () => value;
    }

    factory(serviceIdentifier: string, factory: () => any) {
        this.factories[serviceIdentifier] = factory;
    }

    singleton(serviceIdentifier: string, factory: () => any) {
        this.factories[serviceIdentifier] = () => {
            let val = factory();
            this.factories[serviceIdentifier] = () => val;
            return val;
        }
    }

    get(serviceIdentifier: string): any {
        if(!this.factories[serviceIdentifier]) { throw new Error(`Service "${serviceIdentifier}" is not registered`); }
        return this.factories[serviceIdentifier].apply(this);
    }
}

export function inject(serviceIdentifier: string) {
    return function(target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        if(!target.constructor.contextTypes) {
            target.constructor.contextTypes = {}
        }
        if(!target.constructor.contextTypes[containerKey]) {
            target.constructor.contextTypes[containerKey] = (): null => null;
        }
        Object.defineProperty(target, propertyKey, {
            get() {
                if(!this.context[containerKey] || !this.context[containerKey].get) {
                    throw new Error(`Context should have dependency container in key "${containerKey}"`);
                }
                return this.context[containerKey].get(serviceIdentifier);
            }
        });
    }
}

export class Provider extends Component<{container: ServiceResolver}> {
    static childContextTypes = {
        container: (): null => null
    }

    getChildContext() {
        return {container: this.props[containerKey]};
    }

    render() {
        return Children.only(this.props.children);
    }
}