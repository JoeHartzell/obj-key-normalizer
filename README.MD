# About

This is a typscript project for normalizing object keys. There are several configurable options (WIP) for modifying how the normalizer works. There are several examples in the 'tests' directory of the project.

# Example
```ts
const source = {
    firstName: 'Joe',
    lastName: 'Hartzell',
    address: {
        'line-1': '123 example rd',
        state: 'PA',
        'zip_code': '12345'
    }
};
const options = {
    deep: true,
    case: 'kebab',
}
const normalizer = new Normalizer(options);

const dest = normalizer.Normalize(source);

// dest object output
// {
//      result: {
//          'first-name': 'Joe',
//          'last-name': 'Hartzell',
//          'address': {
//              'line-1': '123 example rd',
//              'state': 'PA',
//              'zip-code': '12345'
//          }
//      }
// }
```

# Contributing

If there are changes/bugs that are found. Please submit a pull request. Any PRs that do not pass through the linter will not be accepted. The project must also build without modifications to the tsconfig file.
