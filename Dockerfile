# Stage 1: Build the application
# Use an official Node.js runtime as a parent image.
# Using '-alpine' for a smaller base image size.
FROM node:20-alpine AS build

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, pnpm-lock.yaml)
# This step is separated to leverage Docker's layer caching.
# Dependencies are only re-installed if these files change.
COPY package*.json ./

# Install project dependencies.
# If you use yarn, this would be 'RUN yarn install'
# If you use pnpm, this would be 'RUN npm install -g pnpm && pnpm install'
RUN npm install

# Copy the rest of the application's source code.
COPY . .

# Build the application for production.
# This command runs the "build" script from your package.json.
RUN npm run build

# Stage 2: Serve the application using a web server
# Use a lightweight Nginx image for the production stage.
FROM nginx:stable-alpine

# Copy the built static assets from the 'build' stage.
# The output of 'npm run build' is typically in a 'dist' folder.
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to allow traffic to the Nginx server.
EXPOSE 80

# The default Nginx command starts the server.
# This line is not strictly necessary as it's the default behavior of the Nginx image.
CMD ["nginx", "-g", "daemon off;"]
