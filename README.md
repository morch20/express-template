# RESTful API Node with Express.js Server Boilerplate

A boilerplate/starter project for quickly building RESTful APIs using Node.js, Express, and Postgresql.

## Requirements

-   Node.js 20+ and npm

## Getting Started

Run the following command on local environment:

```shell
git clone http://192.168.1.100:4000/joseph.maria/resources.git <my-project-name>
cd my-project-name
npm install
```

Then, you can run the project locally in development mode with live reload executing:

```shell
npm run dev
```

Open http://localhost:5000 with your favorite browser to see your project.

#### Make sure to change the following:

-   Name of the project in the `package.json`.
-   Environment variables in the `.env` and `.env.production` files.
-   Passwords, names, ports, etc... in `docker-compose.yml` and `dockerfile` files.
-   Make sure the ports, names, password, etc... are the **same** in the all the files.

## Table of Contents

-   [Features](#features)
-   [Commands](#commands)
-   [Environment Variables](#environment-variables)
-   [Project Structure](#project-structure)
-   [Error Handling](#error-handling)
-   [Validation](#validation)
-   [Logging](#logging)
-   [Linting](#linting)
-   [Testing](#testing)

## Features

-   **SQL database**: [PostgreSQL](https://www.postgresql.org/) object relational mapping (ORM) using [Drizzle](https://orm.drizzle.team/)
-   **TypeScript**
-   **External Caching**: [Redis](https://redis.io/)
-   **Validation**: request data validation using [Zod](https://zod.dev/)
-   **Logging**: using [Pino](https://getpino.io/), [pino-pretty](https://github.com/pinojs/pino-pretty), and [pino-http](https://github.com/pinojs/pino-http)
-   **Testing**: unit and integration tests using [Jest](https://jestjs.io)
-   **Error handling**: centralized error handling mechanism
-   **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and custom config validation
-   **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
-   **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
-   **Compression**: gzip compression with [compression](https://github.com/expressjs/compression)
-   **Docker support**
-   **Git hooks**: with [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
-   **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
-   **VScode config**: consistent editor configuration using .vscode/settings.json

## Commands

Running locally:

```bash
npm run dev
```

Running in production:

```bash
# Build production
npm run build

# Start production
npm start
```

Testing:

```bash
# run all tests
npm run test

# run all tests in watch mode
npm run test:watch

# run test coverage
npm run test:coverage
```

Linting:

```bash
# run ESLint
npm run lint

# fix ESLint errors
yarn lint:fix

# run prettier
yarn prettier

# fix prettier errors
yarn prettier:fix
```

Database:

```bash
# Generate migrations
npm run db:generate

# Drop a migration
npm run db:drop

# Apply migrations to DB
npm run db:migrate

# Open drizzle studio
npm run db:studio
```

Mis.

```bash
# Remove dist/ and coverage/
npm run clean
```

## Environment Variables

The environment variables can be found and modified in the `.env.example` file. They come with these default values:

```bash
NODE_ENV="development | production | test"
LOG_LEVEL="fatal | error | warn | info | debug"
PORT="5000"

# database
DB_URL="postgresql://<username>:<password>@172.25.0.7:5432/<database>"
DB_HOST="In production use name of db: <database>. In development use 'localhost'."
DB_PORT=5432
DB_DATABASE_NAME=<database>
DB_USERNAME=<username>
DB_PASSWORD=<password>

# redis for caching
REDIS_URL='redis://:<password>@<host>:<port>'
```

## Project Structure

It is up to you to follow one of the two conventions that I would recommend:

-   A - Controllers, Routes, Services, and Data access (models/schemas) as folders

```
 |--api\
    |--resources\    # Services about resources
       |--resources.controllers.ts
       |--resoureces.services.ts
       |--resoureces.dataAccess.ts
       |--...
    |--users\
       |--...
    |--routes\       # Define all routes and middlewares
    |--index.ts      # Export everything
```

-   B - Controllers, Routes, Services, and Data access (models/schemas) as files

```
 |--api\
    |--controllers\
    |--routes\
    |--services\
    |--dataAccess\
    |--routes\       # Define all routes and middlewares
    |--index.ts      # Export everything

```

Overall structure

```
src\
 |--api\            # All the api logic - Good for tracking versioning
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger files
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--db\             # Database client and database logic
 |--lib\            # Generic cross-component functionality
    |--cache\       # Custom caching class using Redis
    |--configs\     # Global configurations and Environment variables
    |--errors\      # Custom Error handler and middleware
    |--logger\      # Custom Logger using Pino
    |--utils\       # Utility functions, constants, etc...
 |--middlewares\    # Custom express middlewares
 |--services\       # External business logic (optional). Good for microservices
 |--tests\          # General tests
 |--app.js          # Express app
 |--index.js        # Server entry point


```

## Error Handling

The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```javascript
import { catchAsync } from "@/lib/utils/functions";

const controller = catchAsync(async (req, res) => {
    // this error will be forwarded to the error handling middleware
    throw new Error("Something wrong happened");
});
```

The error handling middleware sends an error response, which has the following format:

```json
{
    "statusCode": 500,
    "message": "Something went wrong in the server.",
    "errorType": "Internal Server Error",
    "data": {}
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility AppError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```javascript
import httpStatus from "http-status";
import { AppError } from "@/lib/errors";
import { catchAsync } from "@/lib/utils/functionts";
import { User } from "@/api/users/users.dataAccess.ts";

const getUser = async (userId) => {
    const user = await User.getUser(userId);
    if (!user) {
        throw new AppError("User not found", httpStatus.NOT_FOUND);
    }
};
```

The error handling middleware sends an error response, which has the following format:

```json
{
    "statusCode": 404,
    "message": "User not found",
    "errorType": "Not Found",
    "data": {}
}
```

## Validation

Request data is validated using [Zod](https://zod.dev/).

The validation schemas are defined in the `api/resource/resourceSchema` file and are used in the routes by providing them as parameters to the `validate` middleware.

**You can make a `src/validations` folder if you like that approach better**

```javascript
import validate from "@/middlewares/validate";
import { Router } from "express";
import { resourceSchema, resourceController } from "../resources";

const resourceRoute = Router();

resourceRoute
    .route("/")
    .post(validate(resourceSchema), resourceController.createResource)
    .get(resourceController.getResources);

// eslint-disable-next-line drizzle/enforce-delete-with-where
resourceRoute
    .route("/:resourceId")
    .get(resourceController.getResource)
    .patch(validate(resourceSchema), resourceController.updateResource)
    .delete(resourceController.deleteResource);

export default resourceRoute;
```

## Logging

Import the logger from `@/lib/logger`. It is using the [Pino](https://getpino.io/) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```javascript
import { logger } from "@/lib/logger";

logger.fatal("message");
logger.error("message");
logger.warn("message");
logger.info("message");
logger.debug("message");
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `warn`, `error`, and `fatal` logs will be printed to the console. **This can be configured setting LOG_LEVEL in .env**.

This is also configured to log in the console in development and files in production.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using pino-http).

## Linting

Linting is done using [ESLint](https://eslint.org/) and [Prettier](https://prettier.io).

In this app, ESLint is configured to follow the [Airbnb TypeScript style guide](https://github.com/iamturns/eslint-config-airbnb-typescript) with some modifications. It also extends [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to turn off all rules that are unnecessary or might conflict with Prettier.

To modify the ESLint configuration, update the `.eslintrc.json` file. To modify the Prettier configuration, update the `.prettierrc.json` file.

To prevent a certain file or directory from being linted, add it to `.eslintignore` and `.prettierignore`.

To maintain a consistent coding style across different IDEs, the project contains `.editorconfig`

## Testing

The `tsconfig.build.json` file is necessary if we want type safety and linting to take place in test files and folders, but we don't want them to be compiled in the building process.

This way the test files can be in the following formats:

-   src/tests/user/user.test.ts
-   src/api/users/\_\_test\_\_/user.test.ts

And still be sure they won't be included in the compiled build for production 👌🔥
