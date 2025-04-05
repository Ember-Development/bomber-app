# Dockerfile
FROM node:20

# Set working directory
WORKDIR /workspace

# Install pnpm globally
RUN npm install -g pnpm

# Copy everything (including packages, apps, workspace file)
COPY . .

# Move into the API folder
WORKDIR /workspace/apps/api

# Install dependencies from monorepo root
RUN pnpm install --filter ./apps/api...

# Expose the port
EXPOSE 3000

# Start your app (replace with tsx if you want live reload)
CMD ["pnpm", "dev"]
