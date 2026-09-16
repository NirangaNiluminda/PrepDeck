# Architecture — modular monolith, ports only where variation is real

## The dependency rule

```
presentation (app/)  ──┐
                       ├──▶ use-cases ──▶ ports ──▶ domain
infrastructure (adapters/) ──┘                         ▲
                                                       │
                              adapters implement ports ┘
```

- `domain/` imports **nothing**. No mongodb, no next, no zod.
- `use-cases/` import only `domain` + `ports`.
- `adapters/` and `app/` import inward, never the reverse.
- `composition/` is the only place that knows which adapter backs which port.

## Layout

```
src/
  shared/                    result type, Clock, IdGenerator, pagination
  modules/
    questions/
      domain/                entity + value objects (pure TS)
      ports/                 QuestionRepository interface + DTOs
      use-cases/             plain async functions (input, deps)
      adapters/
        in-memory/           used by every test
        mongo/               document shape, mapper, indexes, repository
      index.ts               the module's PUBLIC API
    practice/  exams/  community/  users/     ← same shape
  composition/               container.ts, mongo-client.ts
  app/                       Next.js routes — thin
```

Organised by **feature first, layers inside**. Adding a feature touches one
folder, not five. A module can be deleted or rewritten without archaeology.

## The five rules that are non-negotiable

1. **Domain entities are plain TypeScript.** No `ObjectId`, no Mongoose
   documents, no framework types. IDs are `string` everywhere above the mapper.
2. **`QuestionFilter` is a closed type, not a passthrough query.** The moment a
   caller can pass `{ $regex: ... }`, Mongo has leaked into the application and
   Postgres becomes a rewrite rather than a swap.
3. **Mappers live in each adapter.** `toDomain` / `toPersistence`. The domain
   never knows the schema shape.
4. **Use cases run with no database.** Proven by `tests/questions.test.ts`
   against `InMemoryQuestionRepository`. This is the actual test of whether the
   abstraction is real.
5. **Cross-module imports go through `index.ts` only.** Enforce with ESLint
   `no-restricted-imports` banning `@/modules/*/domain/*` and
   `@/modules/*/adapters/*` from outside the owning module.

## What is deliberately NOT here

Skipped until something forces it: CQRS, event sourcing, separate read models,
Specification pattern, `IUseCase<TIn,TOut>` interfaces, a DTO for every entity,
a port for the logger. Structure is strict; contents are thin. A use case of
15 lines is correct — if one passes ~40 lines, extract a domain service.

## Swapping MongoDB for PostgreSQL

1. Write `adapters/postgres/postgres-question-repository.ts` implementing
   `QuestionRepository`.
2. Write `adapters/postgres/question-row.ts` with the mapper.
3. Change one line in `composition/container.ts`.
4. Run `tests/questions.test.ts` — unchanged — plus a contract test against the
   new adapter.

Nothing in `domain/`, `use-cases/`, or `app/` moves. That is the whole payoff.

## Copying this pattern to a new module

For `practice/`:

- `domain/attempt.ts`, `domain/scheduler.ts` (SM-2 as a pure function)
- `ports/attempt-repository.ts` + `AttemptFilter`
- `use-cases/record-attempt.ts`, `use-cases/get-due-cards.ts`
- `adapters/in-memory/`, `adapters/mongo/`
- `index.ts` exporting use cases + types only

`practice` gets questions by calling `getQuestion` from `@/modules/questions`,
never by touching the questions collection directly.

## Known rough edges left visible on purpose

- `MongoQuestionRepository.toSort` sorts difficulty alphabetically
  (easy < hard < medium). Fix by persisting a numeric `difficultyRank` in the
  mapper. Left in as an example of a concern the adapter owns and the domain
  must not.
- Free-text search uses a regex scan. Fine to a few thousand questions; move to
  Atlas Search or Meilisearch behind the same `QuestionFilter.text` field —
  the port does not change.
- `existsWithStem` is exact-match dedupe. Community submissions need fuzzy
  duplicate detection; add it as a separate port method, not inside the entity.

## Setup

```bash
npm i mongodb zod
npm i -D vitest @types/node
```

`tsconfig.json` needs the path alias:

```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] }, "strict": true } }
```

`.env.local`:

```
MONGODB_URI=mongodb+srv://...
MONGODB_DB=interview_prep
```

`getSession()` from `@/modules/auth` is referenced by the routes and is the one
thing not implemented here — return `{ userId: string; role: 'user' | 'admin' }`
or `null`.
