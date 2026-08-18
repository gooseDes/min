set positional-arguments

# Web app scripts
mod web "apps/web"

# Tauri app scripts
mod desktop "apps/desktop"

# Flutter app scripts
mod fl "apps/flutter"

# Interactive runner
@default:
    @just --choose

# Run the linter on the entire codebase
lint:
    pnpm exec eslint .

# Deploy the app
deploy: lint
    git push origin main:release -f

# Install all dependencies
install:
    pnpm install
    just flutter::install
