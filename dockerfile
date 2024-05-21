FROM node:20.11.1-slim

# Create app directory
WORKDIR /opt/api

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Build JavaScript from TypeScript
COPY . .
RUN NODE_OPTIONS=--max-old-space-size=8192 npm run build

# Tell docker which port will be used (not published)
EXPOSE 5000

# Run this app when a container is launched
# "node -r ts-node/register -r tsconfig-paths/register dist/src/index.js"
CMD [ "node", "-r", "ts-node/register", "-r", "tsconfig-paths/register", "dist/src/index.js" ]
