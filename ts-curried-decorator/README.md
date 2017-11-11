# Type inference and curried functions in typescript\

Implementation in [index.ts](./index.ts) provides type inference for up to 5 parameters. More could be added.


```ts
const f2 = curried((a: number, b: number) => a + b);

f2(1); // inferred type: (number) => number
f2(1, 2); // inferred type: number
f2(1)(2); // inferred type: number

const f3 = curried((a: number, b: number, c: number) => a + b);
f(1); // inferred type: (number, number) => number | (number) => (number) => number;
f(1, 2); // inferred type: (number) => number
f(1)(2); // inferred type: (number) => number
f(1)(2, 3); // inferred type: number
```