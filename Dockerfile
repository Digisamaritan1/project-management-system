# Wrapped whole in app
FROM node:20 AS base
WORKDIR /app

# Copy the brand settings file first
COPY brandSettings.json ./
COPY package.json ./

# Build API
FROM base AS api-build
COPY package*.json ./
RUN npm install
COPY . .

# Build Admin
FROM base AS admin-build
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm install
COPY admin/ .
RUN npm run build

# Build Frontend
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN ln -s /app/brandSettings.json /app/frontend/brandSettings.json
RUN npm run build
RUN rm -f package*.json
RUN ln -s /app/package.json /app/frontend/package.json

# Production Server
FROM node:20 AS production
WORKDIR /app
COPY --from=frontend-build /app/frontend/dist frontend/dist
COPY --from=admin-build /app/admin/dist admin/dist
COPY --from=api-build /app .
COPY index.js .
COPY server.js .

# Ensure all dependencies for production are installed
RUN npm install --production

EXPOSE 4000
CMD ["node", "server.js"]