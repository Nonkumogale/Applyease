# AGENTS.md

## Project Context

This is a student application hub (Applyease) repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and deployment workflow.

## Key Files

- `src/`: frontend application source.
- `src/lib/api-client.ts`: frontend API client.
- `vite.config.js`: Vite configuration.
- `.env`: environment variables; never commit secrets.

## Working Notes

- Use `npm run dev` or `pnpm run dev` for local development.
- The project uses pnpm workspaces with the main app in `artifacts/apply-ease/`.
- Run `PORT=5173 BASE_PATH=/ pnpm run dev` to start the development server.
- Run the relevant checks from `package.json` before finishing code changes.
