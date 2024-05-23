FROM node:20.11.1 AS build

USER node
WORKDIR /home/node/app

# Copy dependency information and install all dependencies
COPY --chown=node:node package.json package-lock.json ./

RUN npm ci

# Copy source code (and all other relevant files)
COPY --chown=node:node . .

# In case the migration files are not up to date with the schemas
RUN npm run db:generate

# Build code
RUN npm run build

# Run-time stage
FROM node:20.11.1-slim

# Set non-root user and expose port
USER node
EXPOSE 5000

WORKDIR /home/node/app

# Copy dependency information and install production-only dependencies
COPY --chown=node:node package.json package-lock.json ./

# Install dependencies from package-lock.json. Omit devDependencies. Ignore scripts when installing. Ex: Husky's prepare 
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy results from previous stage
COPY --chown=node:node --from=build /home/node/app/dist ./dist

# Copy migrations - For God's sake don't forget this line 😭
COPY --chown=node:node --from=build /home/node/app/src/db/migrations ./dist/src/db/migrations

# For the moment use node instead of npm so signals are recieved
CMD [ "node", "dist/src/index.js" ]
