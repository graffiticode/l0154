FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/app/package*.json ./packages/app/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies for production
RUN npm prune --omit=dev

ENV NODE_ENV=production

CMD [ "npm", "start" ]
