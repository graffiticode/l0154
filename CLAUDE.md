# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

L0154 is a Graffiticode language for creating interactive magic square math puzzles. It compiles a domain-specific language into interactive grid-based exercises rendered with LaTeX (KaTeX) and ProseMirror table editing.

## Repository Structure

npm workspaces monorepo with two packages:
- **`packages/api`** — Node.js/Express backend: compiler, routes, auth, static assets
- **`packages/app`** — React component library (`@graffiticode/l0154`): ProseMirror grid editor, SWR data fetching, Tailwind CSS styling. Published as UMD + ESM.

## Common Commands

```bash
# Development
npm run dev                        # Start API server with nodemon (uses Firestore emulator)
npm run -w packages/app dev        # Start Vite dev server for app
npm run -w packages/app storybook  # Storybook component explorer on port 6006

# Build
npm run build                      # Full build: app → api → static (lexicon + spec)
npm run -w packages/app build      # Build app library only (tsc + vite)
npm run -w packages/api build      # Build API only (tsc + vite)

# Lint
npm run lint                       # Lint root test/ directory
npm run -w packages/api lint       # Lint API source
npm run -w packages/app lint       # Lint app source

# Deploy (Google Cloud Run)
npm run gcp:build                  # Submit Cloud Build
npm run gcp:deploy                 # Deploy to Cloud Run (port 50154)
```

## Testing

Tests use **Jest** and are located alongside source files as `*.spec.js` in `packages/api/src/`. HTTP route tests use **supertest**.

There is no single `npm test` script configured — run Jest directly:
```bash
npx jest                                        # Run all tests
npx jest packages/api/src/compile.spec.js       # Run a single test file
npx jest --testPathPattern="routes"             # Run tests matching pattern
```

## Architecture

### Compiler Pipeline

The compiler extends `@graffiticode/basis` (Checker, Transformer, Compiler). Key AST node transformers in `packages/api/src/compiler.js`:
- `MAGIC_SQUARE` — generates a 3×3 magic square scaled to a target sum
- `INITIALIZE_GRID`, `SHOW_FEEDBACK` — configure grid behavior with data overrides
- `TABLE`, `COLS`, `ROWS` — define grid dimensions
- `EXPRESSION` — LaTeX math expression (parsed with `@artcompiler/parselatex`, rendered with KaTeX)
- `PROG` — root node, pops final value from evaluation stack

Compilation is triggered via `POST /compile` route.

### Frontend Rendering

- **`view.jsx`** — top-level React component; uses SWR to fetch and recompile data, manages state via a reducer pattern (`createState`)
- **`Form.tsx`** — renders problem statement (HTML), LaTeX expression (KaTeX), and the grid editor
- **`GridEditor.tsx`** — ProseMirror-based table editor with cell validation decorations (red highlights for incorrect sums); debounced state updates (1s)
- **`lib/api.js`** — API client using `bent`; dynamically selects localhost:3100 (dev) vs api.graffiticode.org (prod)

### Authentication

Token-based auth via `@graffiticode/auth`. Validated per-request in middleware. Auth is optional for some routes (graceful degradation).

## Deployment

- **Dockerfile**: Alpine Node 22, multi-stage (install → build → prune devDeps → run)
- **GitHub Actions** (`.github/workflows/deploy-gcp.yml`): pushes to main deploy to production Cloud Run; develop → staging; feature/* → preview environments with PR comments
- **Port**: 50154

## Key Conventions

- ESM throughout (`"type": "module"` in all package.json files)
- Both packages build with `tsc && vite build`
- API serves compiled static assets from `dist/` and `public/`
- The `sync` script packs the app and copies the tarball to a separate Learnosity integrations project
