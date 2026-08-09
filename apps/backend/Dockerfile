FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
COPY apps/backend ./apps/backend
RUN pnpm run --filter backend build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend

EXPOSE 5000
CMD [ "pnpm", "run", "start" ]
