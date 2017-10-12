# About

Proof of concept RPC implementation with shared interface between client and server
and static type checks for server implementation and client calls.

## Goals

1) Desribe API as typescript Interface, all methods must return Promise
2) On server use `class ImplementationX implements InterfaceX` to implement the interface
3) On client use `new RemoteApi<IX>()`, without having to duplicate method descsriptors.

## What I managed to achieve

### 1) Define available API methods - easy

```ts
interface ServiceApi {
    add(a: number, b: number) : Promise<number>;
}
```

### 2) Implement api on the server - easy

```ts
class Serivce implements ServiceApi {
    async add(a, b) {
        return a + b;
    }
}
```

### 3) Typesafe API consumption on the client - a bit problematic

```ts
let api = new RemoteApi<ServiceApi>('ws://localhost:8080');

let result: number = await api.method('add')(5, 2);
```

Illustration for type safety on client side:

```ts
api.method('add')('something', 2);
// [ts] Argument of type '"something"' is not assignable to parameter of type 'number'.
```

Ideally I would like to have `api.add(5, 2)` instead of `api.method('add')(5, 2)`. Unfortunatelly
Interface definition is not available in compiled javascript, so it's not possible to dynamically initialize
an object with method names loaded from the interface.

I tried to figure out if I can avoid re-typing method definitions on
client code and so far came up only with this solution:

```ts
class Client<T> {
    method<K extends keyof T>(method: K): T[K];
}
```

`T` is interface of the API. In this case `T` should only contain async methods.
`K` is list of keys in the interface - names of all the async methods.
This way typescript figures that given key `K` as argument, the function
`method()` will return signature of `T[K]`.

I discovered that [ts-transformer-keys](https://github.com/kimamula/ts-transformer-keys) would
be super useful in this situation. A rather strong downside of this solution however is that it
requires writing custom compiler executable.