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

- Next.js 15 (App Router), TypeScript strict, React Server Components
- MongoDB Atlas via the **native `mongodb` driver** — not Mongoose
- Zod for boundary validation
- Vitest for tests
- Tailwind + shadcn/ui
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
    practice/  exams/  community/  users/
  composition/     container.ts — the only place adapters are wired
  app/             Next.js routes — thin
```

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

- [ ] `npx tsc --noEmit` clean
- [ ] Use-case tests pass against the in-memory adapter
- [ ] No new import crosses the dependency rule
- [ ] Any new `QuestionFilter`-style field handled in **both** adapters
- [ ] Any new Mongo query has a backing index in the `*_INDEXES` export
- [ ] Any new user-scoped query filters by `userId`

## Current state

Stage 1 scaffold exists: the `questions` module is complete end-to-end (domain,
port, both adapters, four use cases, route handlers, test suite). Use it as the
template for every other module. `getSession()` from `@/modules/auth` is
referenced but not implemented — it returns
`{ userId: string; role: 'user' | 'admin' } | null`.

See `PROJECT_PLAN.md` for the staged roadmap and `ARCHITECTURE.md` for the
layering rationale.
