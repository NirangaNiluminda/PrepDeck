@AGENTS.md

# CLAUDE.md

Persistent context for this repository. Read before making any change.

## What this is

**PrepDeck** — a personal-then-public interview preparation platform. A
filterable knowledge base of technical interview questions, a spaced-repetition
practice loop, timed mock exams, and a community contribution flow.

Origin: the founder accumulated a large body of interview Q&A in long chat
transcripts that are impossible to revise from. Stage 1 exists to turn that
corpus into something searchable. Everything after that is built on the same
question store.

Audience order: (1) the founder, (2) his friends, (3) open signups.
Do not build for scale that does not exist yet — but do not build in a way that
blocks it either.

## Stack

- Next.js 16 (App Router), TypeScript strict, React Server Components
- MongoDB Atlas via the **native `mongodb` driver** — not Mongoose
- Zod for boundary validation
- Vitest for tests
- Tailwind v4 with `@tailwindcss/typography`; `react-markdown` for question
  content. shadcn/ui is planned but not adopted: Stage 1 uses native form
  controls, which a GET filter form and server actions need anyway.
- Hosted on Vercel

**The database must remain swappable to PostgreSQL.** This is a hard product
requirement, not a preference. Every decision below follows from it.

## Architecture: modular monolith, feature-first

```
src/
  shared/          Result type, Clock, IdGenerator, pagination
  modules/
    questions/     ← reference implementation, copy its shape
      domain/      entity + value objects — PURE TypeScript
      ports/       interfaces + DTOs
      use-cases/   plain async functions
      adapters/    in-memory/ and mongo/
      index.ts     the module's public API
    bookmarks/     per-user stars, same shape
    importer/      markdown question files → import items (structure only)
    auth/          getSession() behind an AuthProvider port
    practice/  exams/  community/  users/     ← not built yet
  composition/     container.ts — the only place adapters are wired
  app/             Next.js routes — thin
    _components/   UI pieces; _lib/ presentation helpers; actions/ server actions
content/questions/ the question corpus, one markdown file per question
```

**Client components never import `@/modules/*`.** A module's `index.ts` also
exports its Mongo adapter, so importing it from client code would pull the
database driver into the browser bundle. Pass data down as props; display
labels live in `app/_lib/labels.ts`, which imports nothing.

Dependency rule: `domain` imports nothing. `use-cases` import `domain` + `ports`
only. `adapters` and `app` import inward, never outward.

## Non-negotiable rules

1. **No database types above the mapper.** No `ObjectId`, no driver types, no
   Mongoose documents in `domain/`, `use-cases/`, `ports/`, or `app/`. IDs are
   `string`. `_id` holds our own UUID.
2. **Filters are closed types, never passthrough queries.** `findByFilter(f:
   QuestionFilter)`, never `find(q: any)`. If a caller can pass `$regex`, Mongo
   has leaked and Postgres is a rewrite. Adding a search capability means adding
   a field to the filter type and handling it in every adapter. That cost is the
   point.
3. **Every repository gets an in-memory adapter, written first.** The entire
   use-case suite runs against it with no database. If a test needs Mongo, a
   dependency has leaked.
4. **Use cases are plain functions**: `(input, deps) => Promise<Result<T>>`.
   No classes, no constructors, no `IUseCase<TIn,TOut>`.
5. **Cross-module imports go through `index.ts` only.** Never
   `@/modules/practice/domain/attempt`. Enforced by ESLint.
6. **Route handlers do four things**: parse+validate (Zod), read identity from
   the session, call one use case, map `Result` to HTTP. No business logic, no
   DB access.
7. **Identity comes from the session, never the request body.** `authorId`,
   `userId`, `role` are server-derived. Always.
8. **Soft delete only** for anything user-contributed. Status becomes
   `archived`; rows are never removed.
9. **Inject `Clock` and `IdGenerator`.** No `new Date()` or `randomUUID()` inside
   domain or use-case code — tests assert exact values.
10. **State transitions live on the entity**, not in use cases. `question.publish()`
    owns the rule so it holds for every caller including importers and scripts.

## Error handling

Expected failures return `Result<T, AppError>` with codes
`VALIDATION | NOT_FOUND | CONFLICT | FORBIDDEN | UNAUTHENTICATED`.
Throw only for bugs and infrastructure faults. `app/api/questions/http.ts` maps
codes to status. Never let a raw driver error reach the client.

## What NOT to build

Do not add, until something concrete forces it: CQRS, event sourcing, separate
read models, the Specification pattern, a DI framework, a port for the logger,
a DTO for every entity, microservices, GraphQL, a state management library.

Structure is strict; contents are thin. A 15-line use case is correct. If one
passes ~40 lines, extract a domain service.

## Conventions

- Files `kebab-case.ts`. Types `PascalCase`. Functions `camelCase`.
- Named exports only, except Next.js pages/layouts.
- One use case per file, named after the file.
- `readonly` on DTO and props fields by default.
- Tests colocated in `tests/<module>.test.ts`, named
  `describe('useCaseName') > it('does X when Y')`.
- Comments explain **why**, never what. Delete any comment restating the code.

## Definition of done for any change

- [ ] `npx tsc --noEmit` clean (run `npx next typegen` first after adding a route)
- [ ] Use-case tests pass against the in-memory adapter
- [ ] No new import crosses the dependency rule
- [ ] Any new `QuestionFilter`-style field handled in **both** adapters
- [ ] Any new Mongo query has a backing index in the `*_INDEXES` export
- [ ] Any new user-scoped query filters by `userId`

## Current state

**Stage 1 is built** (see the ticked boxes in `PROJECT_PLAN.md`). What exists:

- `questions`: slugs, create / update / publish / archive / restore, search
  with an `ids` filter, facets (topic tree + tag counts), and `importQuestions`,
  which upserts by slug with a dry run and field-level diffs.
- `importer`: parses `content/questions/**/*.md`; run it with
  `npm run import-questions -- [--dry-run] [--publish]`. `tests/content.test.ts`
  fails if any corpus file doesn't parse or import cleanly.
- `bookmarks`: per-user stars.
- `auth`: `getSession()` is a **dev stand-in** reading `DEV_USER_ID` /
  `DEV_USER_ROLE`. NextAuth + GitHub is still to do, before Stage 4.
- UI: browse (`/`), question detail, admin create/edit, all keyboard-driven.
- Atlas `interview_prep` holds the 28 `starter-seed` questions, published.

The plan says to use Stage 1 for a week before starting Stage 2. The starter
questions should be rewritten or replaced with the real transcript corpus.

Pages call `getViewer()` (from `app/_lib/viewer.ts`), which calls
`connection()`: the dev auth adapter reads env vars rather than cookies, so
without it Next.js may prerender a page and serve a stale copy.

See `PROJECT_PLAN.md` for the staged roadmap and `ARCHITECTURE.md` for the
layering rationale.
