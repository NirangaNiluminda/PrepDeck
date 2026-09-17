# PrepDeck

A filterable, practisable knowledge base of technical interview questions —
built to replace revising from long, unsearchable chat transcripts.

Spaced repetition is here; timed mock exams and community contributions come
later — see [`PROJECT_PLAN.md`](PROJECT_PLAN.md) for the staged roadmap.

## Stack

Next.js 16 (App Router) · TypeScript strict · MongoDB via the native driver ·
Zod · Vitest · Tailwind

The database is kept swappable to PostgreSQL by design. The reasoning, and the
layering that buys it, is in [`ARCHITECTURE.md`](ARCHITECTURE.md); the rules
that must hold for any change are in [`CLAUDE.md`](CLAUDE.md).

## Getting started

```bash
npm install
cp .env.example .env.local                 # then fill in MONGODB_URI
npm run ensure-indexes                     # creates the indexes
npm run import-questions -- --publish      # loads content/questions
npm run dev
```

Then open http://localhost:3000.

| Page | What it does |
|---|---|
| `/` | Browse and search. Filters live in the URL, so any view can be shared. `/` focuses search, `j` / `k` move through results, `Enter` opens one. |
| `/questions/[id]` | One question, with a private notes box. `Space` reveals the answer, `Esc` goes back to the results. |
| `/practice` | The review session: due cards, then new ones up to a daily cap. `Space` reveals, `1`–`4` rate again/hard/good/easy. |
| `/progress` | Streak, cards due, mastery by topic, and weakest topics with a one-click link into a session on just that topic. |
| `/?bookmarked=1` | Your starred questions. |
| `/admin/questions/new` | Write a question (admins). Edit, publish, archive and restore from the question page. |

The JSON API lives at `GET /api/questions` and `GET /api/questions/[id]`.

## Adding questions

Questions live in [`content/questions/`](content/questions/), one markdown file
each. The format and workflow are in that folder's README. In short:

```bash
npm run import-questions -- --dry-run      # see what would change
npm run import-questions -- --publish      # write it
```

Re-importing is safe: files are matched to questions by slug (the file name), so
an edited file updates its question and an unchanged file is skipped.

Auth is a Stage 0 stand-in: `DEV_USER_ID` / `DEV_USER_ROLE` in `.env.local` are
read by `DevAuthProvider` behind the `AuthProvider` port. Unset `DEV_USER_ID` to
exercise the signed-out path. Real accounts arrive in Stage 4.

## Scripts

| Command | Does |
|---|---|
| `npm test` | Use-case, importer and corpus tests — **no database needed** |
| `npm run typecheck` | `tsc --noEmit` (run `npx next typegen` first after adding a route) |
| `npm run lint` | ESLint, including the module-boundary rule |
| `npm run ensure-indexes` | Idempotent index creation for every collection |
| `npm run import-questions` | Import `content/questions`; `--dry-run`, `--publish`, `--author` |

## API testing with Postman

Import both files in [`postman/`](postman/) and select the **PrepDeck (local)**
environment. Run folder 1 (question lifecycle), then folder 2 (validation
errors). Folder 3 covers signed-out and non-admin behaviour and needs
`.env.local` changes described in its folder notes.

Folder 1 writes real questions tagged `postman`. Remove them in Atlas with the
filter `{ "source": "postman" }`.

The same collection runs from the command line:

```bash
npx newman run postman/PrepDeck.postman_collection.json \
  -e postman/PrepDeck.local.postman_environment.json \
  --folder "2. Validation errors"
```

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
    bookmarks/     per-user stars
    notes/         per-user private notes on a question
    importer/      markdown files → questions
    practice/      Attempt, ReviewCard, SM-2 scheduler, due queue, mastery
    auth/          dev sign-in behind an AuthProvider port
  composition/     the only place adapters are wired
  app/             Next.js pages, server actions and API routes — thin
content/questions/ the question corpus
```

Modules talk to each other through `index.ts` only. That boundary is enforced by
a `no-restricted-imports` rule in `eslint.config.mjs`, not by convention.
