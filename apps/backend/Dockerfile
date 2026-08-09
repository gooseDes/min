FROM node:22-slim AS runner
WORKDIR /app

COPY dist/backend ./

EXPOSE 5000

CMD [ "pnpm", "start" ]
