# Dockerfile to deploy a Google Cloud Function to Cloud Run

# Stage 1: Use Node.js as the base image for building the function
FROM node:16 AS build

# Set working directory
WORKDIR /app

# Copy function code
COPY . .

# Install dependencies
RUN npm install

# Stage 2: Use a lightweight Node.js image for running the function
FROM node:16-slim

# Set working directory
WORKDIR /app

# Copy function code from the build stage
COPY --from=build /app /app

# Expose the port Cloud Run will use
EXPOSE 8080

# Set environment variable for Cloud Functions Framework
ENV PORT 8080

# Start the function using the Google Cloud Functions Framework
CMD ["npm", "start"]
