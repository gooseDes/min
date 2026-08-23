set positional-arguments

# Backend scripts
mod back "apps/backend"

# Web app scripts
mod web "apps/web"

# Tauri app scripts
mod desktop "apps/desktop"

# Flutter app scripts
mod fl "apps/flutter"

# Schemas-related scripts
mod schemas "packages/schemas"

# api package scripts
mod api "packages/api"

# dart-api package scripts
mod dart-api "packages/dart-api"

# Interactive runner
@default:
    @just --choose

# Run the linter on the entire codebase
lint:
    pnpm exec eslint .

# Check for typescript errors
typecheck:
    pnpm exec tsc -p tsconfig.typecheck.json

# Deploy the app
deploy: typecheck lint
    git push origin main:release -f

# Install all dependencies
install:
    pnpm install
    just fl::install

# Convert schemas to TypeScript types
generate-ts:
    just schemas to-ts
    mv packages/schemas/types.ts packages/ts-types/src/types.ts

# Convert schemas to every supported target
generate-all:
    just generate-ts
    just schemas to-dart
    just dart-api generate

# Watch for changes
watch-all:
    just dart-api watch
