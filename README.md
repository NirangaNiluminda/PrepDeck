# PrepDeck

A filterable, practisable knowledge base of technical interview questions —
built to replace revising from long, unsearchable chat transcripts.

Spaced repetition, timed mock exams and community contributions come later; see
[`PROJECT_PLAN.md`](PROJECT_PLAN.md) for the staged roadmap.

## Stack

Next.js 16 (App Router) · TypeScript strict · MongoDB via the native driver ·
Zod · Vitest · Tailwind

The database is kept swappable to PostgreSQL by design. The reasoning, and the
layering that buys it, is in [`ARCHITECTURE.md`](ARCHITECTURE.md); the rules
that must hold for any change are in [`CLAUDE.md`](CLAUDE.md).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI
npm run ensure-indexes       # creates the questions indexes
npm run dev
```

The API lives at `GET /api/questions` and `GET /api/questions/[id]`.

Auth is a Stage 0 stand-in: `DEV_USER_ID` / `DEV_USER_ROLE` in `.env.local` are
read by `DevAuthProvider` behind the `AuthProvider` port. Unset `DEV_USER_ID` to
exercise the signed-out path. Real accounts arrive in Stage 4.

## Scripts

| Command | Does |
|---|---|
| `npm test` | Use-case suite against the in-memory adapter — **no database needed** |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, including the module-boundary rule |
| `npm run ensure-indexes` | Idempotent index creation from `QUESTION_INDEXES` |

## Layout

```
src/
  shared/          Result type, Clock, IdGenerator, pagination
  modules/
    questions/     reference implementation — copy its shape
      domain/      pure TypeScript, imports nothing
      ports/       interfaces + DTOs
      use-cases/   plain async functions
      adapters/    in-memory/ and mongo/
      index.ts     the module's public API
    auth/
  composition/     the only place adapters are wired
  app/             Next.js routes — thin
```

Modules talk to each other through `index.ts` only. That boundary is enforced by
a `no-restricted-imports` rule in `eslint.config.mjs`, not by convention.
