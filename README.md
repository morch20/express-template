### tsconfig.build.json

This file is necessary if we want type safety and linting to take place in test files and folders, but we don't want them to be compiled in the building process.

This way the test files can be in the following formats:

-   src/tests/user/user.test.ts
-   src/api/users/\_\_test\_\_/user.test.ts

And still be sure they won't be included in the compiled build for production 👌🔥
