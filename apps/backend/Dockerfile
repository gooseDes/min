FROM node:22-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.21.0

WORKDIR /app

COPY dist/backend ./

EXPOSE 5000

ENV NODE_ENV=production

CMD [ "pnpm", "exec", "tsx", "--env-file=.env", "src/main.ts" ]
