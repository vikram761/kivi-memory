FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .

# Build the TypeScript code into a single executable bundle
RUN bun build src/index.ts --target=bun --outfile=dist/index.js

EXPOSE 8000

# Push the Drizzle schema to create tables, then start the built server
CMD ["sh", "-c", "bunx drizzle-kit push && bun dist/index.js"]
