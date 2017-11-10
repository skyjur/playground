# Inversifyjs + React

Playing around and figuring how to plug inversifyjs to React.

Found two libraries on npm that are solving this problem:
[inversify-react](https://www.npmjs.com/package/inversify-react) and
[react-inversify](https://www.npmjs.com/package/react-inversify).

I thought naming for these two libraries was pretty clever. I'm not sure if was contious choice, or just a coincidence.
`react-inversify` with `connect()` decorator seems to follow similar pattern that is found in `react-redux`, so it's more "react-like".
`inversify-react` on other hand has API which resembles more inversifyjs it self, with `@resolve` decorator for React components, which works in very similar way how `@inject` works in `@injectable` class.

 `inversify-react` had exactly the kind of API that I wanted to get, so I went with it. Did not even tried `react-inversify` as I did not liked too much the redux-like approach with `connect()`.