# auth server build
FROM node:18 AS auth-build

WORKDIR /usr/src/crimmit-auth-server
COPY crimmit-auth/package*.json ./
RUN npm install
COPY crrimmit-auth .
RUN npm run build

# authserver production
FROM node:18 AS auth-prod
WORKDIR /usr/src/crimmit-auth-server
# Copy only the built application and node_modules from the previous stage
COPY --from=auth-build /usr/src/crimmit-auth-server .
# Expose the port
EXPOSE 5009
# Command to run the application
CMD ["node", "build/index.js"]


# todo build
FROM node:18 AS todo-build
WORKDIR /usr/src/crimmit-todo-server
COPY crimmit-todo/package*.json ./
RUN npm ci --only=production
# Copy application code
COPY crimmit-todo .
RUN npm run build

# todo production
FROM node:18 AS todo-prod
WORKDIR /usr/src/crimmit-todo-server
# Copy only the built application and node_modules from the previous stage
COPY --from=todo-build /usr/src/crimmit-todo-server .
# Expose the port
EXPOSE 5010
# Command to run the application
CMD ["node", "build/app.js"]

# # Nginx setup for serving both servers
# FROM nginx:stable-alpine
# # Remove default nginx config
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d

# # Copy built applications to nginx served directory
# COPY --from=auth-build /usr/src/crimmit-auth-server/build /usr/share/nginx/html/crimmit-auth-server
# COPY --from=todo-build /usr/src/crimmit-todo-server/build /usr/share/nginx/html/crimmit-todo-server
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]