# Smesher Monitor App

## Getting started

1. Install dependencies.

   ```bash
   yarn
   ```

2. Serve with hot reload at http://localhost:5173.
   ```bash
   yarn dev
   ```

3. If you want to connect to the local node you may need to run cors middleware:
  ```bash
  yarn cors
  ```
  Later you can connect to your node using URL:
  ```
  http://localhost:8080/0.0.0.0:9071
  ```

### Lint commands

- Run eslint
  ```bash
  yarn lint
  ```
- Run eslint with fixing
  ```bash
  yarn lint:fix
  ```

### Build commands

```bash
yarn build
```

### Test commands

- Run tests with coverage (will open the coverage if all tests succeed)
  ```bash
  yarn test
  ```
- Watch tests
  ```bash
  yarn test:watch
  ```

### Commit commands
This project use [commitlint](https://github.com/conventional-changelog/commitlint) to ensure that commit messages are [conventional-changelog](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional) compliants.

To help you build more efficient commit messages, you can use the [commitizen](https://github.com/commitizen/cz-cli) package by running this command :
```bash
yarn cz
```