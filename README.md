# Piggytracker Backend

Backend for piggytracker. See https://www.piggytracker.org for more information. 

## Quick Start

Get started developing...

```shell
# install deps
npm install

# run in development mode
npm run docker
npm run dev

# run tests
npm run test
```

---

## Install Dependencies

Install all package dependencies (one time operation)

```shell
npm install
```


## Copy default configuration

To get started on your local machine you can use the default config file. Feel free to change this file later on. 

```shell
cp .env-default .env
```

## Create user

```shell
npm run cli -- --help
npm run cli -- createuser <USERNAME>

```

## Run It
#### Run in *development* mode:
Runs the application in development mode. Should not be used in production

```shell
npm run dev
```

or debug it

```shell
npm run dev:debug
```

#### Run in *production* mode:

Compiles the application and starts it in production production mode.

```shell
npm run compile
npm start
```

## Test It

Run the Mocha unit tests

```shell
npm test
```

or debug them

```shell
npm run test:debug
```

## Try It
* Open you're browser to [http://localhost:3000](http://localhost:3000)
* Invoke the `/examples` endpoint 
  ```shell
  curl http://localhost:3000/api/v1/examples
  ```


## Debug It

#### Debug the server:

```
npm run dev:debug
```

#### Debug Tests

```
npm run test:debug
```

#### Debug with VSCode

Add these [contents](https://github.com/cdimascio/generator-express-no-stress/blob/next/assets/.vscode/launch.json) to your `.vscode/launch.json` file