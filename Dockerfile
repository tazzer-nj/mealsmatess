# MealMate — TanStack Start (nitro) production image.
# The app builds with nitro's node-server preset and serves on 0.0.0.0:$PORT.
FROM oven/bun:1-alpine AS build
RUN apk upgrade --no-cache && apk add --no-cache nodejs
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ENV NITRO_PRESET=node-server
RUN bun run build
# Drop dev-only packages so the runtime image carries just what nitro needs.
RUN bun install --frozen-lockfile --production

FROM node:26-alpine
# The date keys the build cache so this layer installs today's OS fixes; AppJet keeps it current on deploy.
RUN echo "os-refresh 2026-11-12" && apk upgrade --no-cache
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
