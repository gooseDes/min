FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@11.21.0

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json

RUN pnpm approve-builds --all
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --dangerously-allow-all-builds

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/package.json ./apps/backend/package.json

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

EXPOSE 5000

CMD [ "pnpm", "run", "start" ]
