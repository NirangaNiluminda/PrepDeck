# PrepDeck — Project Plan

Companion to `CLAUDE.md` (rules) and `ARCHITECTURE.md` (layering rationale).
This file holds the product vision, domain model, and staged roadmap.

---

## 1. Problem and vision

Long chat transcripts are a terrible revision format. The content is good; the
container is wrong. PrepDeck turns an accumulated corpus of interview Q&A into
a filterable, practisable, shareable knowledge base.

**Progression of value:**

| Phase | User | Value |
|---|---|---|
| 1 | Founder alone | Stop scrolling transcripts. Find "all DevOps networking questions" in two seconds. |
| 2 | Founder alone | Actually retain the material — spaced repetition beats re-reading. |
| 3 | Founder alone | Rehearse under time pressure before a real interview. |
| 4 | Friends | Shared question bank, personalised by target role. |
| 5 | Open | Community contributions make the bank grow faster than any one person can write. |

**Non-goals.** Not a course platform. Not a video host. Not a job board. Not an
AI question generator (at least not before Stage 5 — curation is the moat).

---

## 2. Domain model

### Core entities

**Topic** — hierarchical, stored as a slug path: `devops/docker/networking`.
Max depth 4. Storing the full path rather than a parent-id chain means "all
questions under devops" is a cheap prefix match in any database — no recursive
CTE, no `$graphLookup`. That portability is deliberate.

**Question** — stem, type (`mcq | short-answer | flashcard | code`), difficulty,
topic path, tags, embedded answer, optional MCQ options, status
(`draft | in-review | published | archived`), authorId, source, version.

The model answer is a **value object embedded in the question**, not a separate
aggregate: it is never queried or edited independently. Split it out only if
answers gain their own lifecycle (multiple community answers, voted separately).

**Attempt** — userId, questionId, self-rating (`again | hard | good | easy`),
correctness for auto-gradable types, time taken, timestamp, examSessionId
(nullable). This single entity powers progress tracking, weak-area detection and
spaced repetition. Never store "have I answered this" on the Question — that
breaks the moment a second user exists.

**ReviewCard** — userId, questionId, interval, ease factor, due date, lapses.
The SM-2 scheduler state, kept separate from Attempt so the algorithm can be
swapped without rewriting history.

**ExamSession** — config (topics, count, duration), **snapshotted questions**,
answers, score, started/finished timestamps. Snapshot because editing a question
later must not retroactively change what a past exam asked.

**Submission** — a community-contributed question awaiting review, with a
moderation trail (reviewerId, decision, note, timestamp).

**Vote** — userId, questionId, direction. Drives recommendations.

**UserProfile** — role (`user | contributor | moderator | admin`), target role
(`swe | devops | fullstack | security`), experience level, onboarding answers,
per-topic mastery scores.

### Relationships that matter

- `Attempt` → `Question` many-to-one, never cascading. Deleting a question
  archives it; attempts survive.
- `ReviewCard` is one per (user, question). Created lazily on first attempt.
- `ExamSession` holds question snapshots, not references.
- `Submission` becomes a `Question` on approval; the submission row is retained
  for audit.

### Invariants worth enforcing in the domain

- Stem length 10–2000 chars.
- Max 10 tags, normalised to lowercase, deduped, sorted.
- MCQ requires ≥2 options with **exactly one** correct.
- Only drafts can enter review; archived must be restored before publishing.
- Every mutation bumps `version` and `updatedAt`.

---

## 3. Module map

| Module | Owns | Depends on |
|---|---|---|
| `questions` | Question entity, topics, search, moderation transitions | — |
| `practice` | Attempt, ReviewCard, SM-2 scheduler, due-card queue | `questions` (via public API) |
| `exams` | ExamSession, generation, scoring, results | `questions` |
| `community` | Submission, Vote, moderation queue, duplicate detection | `questions` |
| `users` | UserProfile, onboarding, mastery, recommendations | `questions`, `practice` |
| `importer` | Markdown/JSON bulk ingest + export | `questions` |

Modules communicate **only** through each other's `index.ts`. `practice` gets a
question by calling `getQuestion`, never by touching the questions collection.

---

## 4. Staged roadmap

Each stage is independently shippable and independently useful.

### Stage 0 — Foundation (½ day)

- [x] `create-next-app` with TypeScript strict, Tailwind, App Router
- [x] `tsconfig` path alias `@/* → ./src/*`
- [x] Copy the `questions` module scaffold in
- [x] Vitest configured with the same path alias; `tests/questions.test.ts` green
- [x] ESLint `no-restricted-imports` blocking `@/modules/*/domain/*` and
      `@/modules/*/adapters/*` from outside the owning module
- [x] `composition/mongo-client.ts` wired, Atlas free tier connected
- [x] Index creation script (`scripts/ensure-indexes.ts`) from `QUESTION_INDEXES`
- [ ] Minimal auth: NextAuth with GitHub provider behind an `AuthProvider` port
      — *partly done: the `AuthProvider` port exists, backed by a dev adapter
      that reads `DEV_USER_ID` / `DEV_USER_ROLE`. NextAuth + GitHub is still to
      do; it matters from Stage 4, when there is more than one user.*

**Done when:** `npm test` passes with no database running, and `npm run dev`
serves `GET /api/questions` returning an empty page.

### Stage 1 — MVP: browse and search (2–3 days)

The only stage that matters for the founder's immediate problem.

- [x] **Bulk importer** — markdown or JSON in, questions out. *Do not skip this.*
      It is how the existing transcript corpus gets in, and it is the highest
      leverage feature in the whole project.
      - Format: front-matter (topic, difficulty, type, tags) + `## Question` /
        `## Answer` / `## Key points` sections
      - Idempotent: re-running updates by stable slug, does not duplicate
      - Dry-run mode printing a diff before writing
      — *markdown only; JSON input not built. `npm run import-questions`.*
- [x] Topic taxonomy seeded from the corpus (`devops/*`, `system-design/*`,
      `databases/*`, `security/*`, `dsa/*`, `web/*`, `behavioural/*`)
      — *seeded with 28 starter questions (`source: starter-seed`), not yet
      the real transcript corpus.*
- [x] Browse page: filter sidebar (topic tree, difficulty, type, tags), result
      list, free-text search, URL-synced filter state so views are shareable
- [x] Question detail: stem, reveal-answer toggle, key points, references
- [x] Bookmark / star (per user, even with one user)
- [x] Admin CRUD for questions (delete is archive, per the soft-delete rule)
- [x] Keyboard navigation: `/` focuses search, `j`/`k` move through results

**Done when:** the founder can find any question from the corpus in under five
seconds and has stopped opening the transcripts. Use it for a week before
starting Stage 2 — real usage will reorder the backlog.
— *Skipped that week: Stage 2 was started the same day, at the user's request
rather than after a week of real usage. Worth watching for whether the due
queue and mastery numbers actually match how the founder uses the app once
there is real usage to compare against.*

### Stage 2 — Practice loop (3–4 days)

This is what converts reading into retention.

- [x] `practice` module: Attempt, ReviewCard, SM-2 scheduler as a **pure
      function** in `domain/scheduler.ts` (testable with zero I/O)
- [x] Flashcard review UI: stem → reveal → self-rate `again | hard | good | easy`
- [x] Keyboard-first: `space` reveals, `1–4` rates. Non-negotiable for 100-card
      sessions.
      — *the whole due queue loads once per session and advances client-side,
      so rating a card never waits on the network; the one deliberate wait is
      finishing the session, which holds for the last one or two ratings still
      in flight before showing the summary — see the "Advance immediately"
      comment in `PracticeSession`.*
- [x] Due-card queue with daily new-card cap
- [x] Per-user private notes on a question — the founder's own rewording, which
      is where the actual learning happens
      — *shipped as its own `notes` module rather than inside `practice`: the
      module map below only lists Attempt/ReviewCard/scheduler/due-queue under
      `practice`'s ownership, and notes have nothing to do with scheduling.*
- [x] Progress dashboard: streak, cards due, per-topic mastery heatmap
- [x] Weak-area detection: topics with lowest mastery surfaced as a suggested
      session
      — *a topic needs at least 3 reviewed questions before it can be called
      "weak" (`getWeakAreas`'s `minReviewed`), so a single unlucky card doesn't
      brand a whole topic.*

**Scheduler note:** wrap SM-2 behind a `ReviewScheduler` interface (Strategy).
You will want to try FSRS later; keep the swap cheap.
— *Done: `ReviewScheduler` lives in `practice/ports/review-scheduler.ts`;
`sm2Scheduler` in `domain/scheduler.ts` is the only implementation.*

**Mastery formula, for whoever swaps it out:** `questionMastery()` in
`practice/domain/mastery.ts` is a heuristic from a card's own interval and
ease factor — 0 until first reviewed, rising toward 100 as the interval
matures past 21 days and the ease factor climbs. It reads two numbers already
on the card rather than maintaining a separate score, and is deliberately the
simplest thing that could work. Replace it once real review history exists to
judge it against.

### Stage 3 — Mock exams (2–3 days)

- [x] `exams` module: ExamSession with question snapshots
- [x] Exam builder: pick topics, count, duration, difficulty mix
      — *"difficulty mix" built as a filter (tick which difficulties to
      include), not a weighted count per level — e.g. not "3 easy, 5 medium,
      2 hard" exactly. Topics support multiple selections (OR), which needed
      a new `topicPaths` filter field alongside the existing single-topic one.*
- [x] Timed runner with countdown, question navigator, flag-for-review,
      autosave every 15s to survive a refresh
      — *answers and flags save immediately on every interaction instead of
      polling every 15s — strictly better for "survives a refresh" once the
      decision below (no free-text capture) removed the one thing a 15s
      batch would have been protecting. The countdown itself needs no
      autosave at all: it's recomputed from the stored `startedAt` +
      `durationMinutes` on every load, so a refresh already shows the true
      remaining time.*
- [x] Answers withheld during the exam (`?reveal=false` on the detail endpoint —
      already implemented in the scaffold)
      — *not via that flag: an exam snapshots its own copy of each question,
      and `ExamRunnerView` vs `ExamResultsView` are two different DTO types,
      not one with an optional field — the correct answer can't be
      constructed on the client while an exam is running, not just hidden
      by it. See `exams/ports/dto.ts`.*
- [x] Auto-scoring for MCQ; self-scoring against key points for short-answer
      — *self-scoring covers every non-MCQ type (short-answer, flashcard,
      code), and is a right/wrong judgment only — no free-text answer is
      captured or stored, so nothing exists for an interviewer-in-training
      to accidentally leak or lose. Every exam answer, MCQ or self-graded,
      also becomes a practice Attempt (rating mapped from correctness),
      feeding the same SM-2 schedule practice sessions do.*
- [x] Results page: score, per-topic breakdown, time per question, review mode
      — *"time per question" only for MCQ, computed from consecutive
      answered-at timestamps during the timed portion; a self-graded
      question has no equivalent real measurement (it's judged in the
      untimed review phase) and is shown as such rather than a fabricated
      number.*
- [x] Exam history with trend over time
      — *a sorted list of past exams and their scores, not a chart; the
      trend is legible from the list at this volume, and PROJECT_PLAN.md's
      own "what NOT to build" list is exactly this kind of restraint.*

### Stage 4 — Multi-user (2 days)

- [ ] Real accounts, roles (`user | contributor | moderator | admin`)
- [ ] **Audit every existing query for missing `userId` scoping before shipping
      this.** Attempts, bookmarks, notes, review cards, exam sessions.
- [ ] Onboarding questionnaire → target role, experience level, weak areas
- [ ] Personalised starter packs derived from onboarding answers
- [ ] Per-user settings: daily card cap, preferred difficulty, timezone

### Stage 5 — Community (4–5 days)

- [ ] `community` module: Submission with moderation trail
- [ ] Submit-a-question form with live preview
- [ ] Moderation queue: approve / reject / request changes, with a note
- [ ] **Duplicate detection** on submit — expect ~30% duplicates. Trigram or
      embedding similarity against existing stems, surfaced as "similar to…"
      before the user submits.
- [ ] Voting (up/down) with abuse guards: one vote per user, rate limited
- [ ] Recommendation feed: highly-voted questions in the user's weak topics
- [ ] Question versioning with edit history and revert
- [ ] Rate limiting on all write endpoints (add it here, not later)
- [ ] Report/flag mechanism for bad content

### Stage 6 — Scale and polish (ongoing)

- [ ] `CachedQuestionRepository` decorator wrapping the real repo
- [ ] Dedicated search: Atlas Search or Meilisearch behind the same
      `QuestionFilter.text` field — the port does not change
- [ ] Domain events + in-process bus (`AttemptRecorded` → update mastery;
      `SubmissionApproved` → publish + reindex). Swap the in-process bus for a
      real queue later without touching use cases.
- [ ] Read-model projections for the mastery heatmap
- [ ] PWA / offline review
- [ ] Anki export
- [ ] Analytics: which questions are most missed, which topics stall

---

## 5. Cross-cutting decisions already made

| Decision | Rationale |
|---|---|
| Native `mongodb` driver, not Mongoose | Schema lives in the mapper, not duplicated in a model. Avoids Mongoose's serverless model-caching pain. |
| UUID string as `_id` | Removes the single most common repository leak — an `ObjectId` escaping into the application layer. |
| Topic as slug path, not parent-id | Descendant queries are a prefix match in every database. |
| Answer embedded in Question | Never queried or edited independently. |
| Snapshot questions into ExamSession | Editing a question must not rewrite history. |
| Soft delete everywhere | Community content is never physically removed. |
| Result type, not exceptions | Expected failures are values; exceptions signal bugs. |

---

## 6. Data seeding: getting the transcript corpus in

The existing material is conversational prose, not structured Q&A. Plan:

1. **Manual pass, topic by topic.** Extract each Q&A pair into the markdown
   import format. Slow but it is also revision — the founder rewriting an answer
   in his own words is the highest-value study activity available.
2. Start with the domains already covered: DevOps (CI/CD, Docker, Terraform vs
   Ansible, AWS, Linux, networking), system design (URL shortener, rate limiter,
   notification system), databases (indexing, normalisation, ACID/BASE, CAP,
   sharding, partitioning), concurrency (race conditions, deadlock), security
   (SQLi, XSS, CSRF, TLS, hashing/salting), DSA (two pointers, sliding window,
   sorting, binary search), and project/behavioural questions.
3. Tag aggressively. Tags are cheaper than deeper topic nesting and better for
   cross-cutting themes (`trade-offs`, `scaling`, `interview-favourite`).
4. Mark difficulty honestly — `hard` should mean "I got this wrong".

**Import format:**

```markdown
---
topic: devops/iac
difficulty: medium
type: short-answer
tags: [terraform, ansible, idempotency]
source: mock-interview-2026-01
---

## Question
What is the difference between Terraform and Ansible, and when would you use each?

## Answer
Terraform provisions infrastructure — what exists. Ansible configures it — what
runs on it. Terraform is declarative state; Ansible is procedural automation.

## Key points
- provisioning vs configuration management
- Terraform state file tracks desired vs actual
- both should be idempotent
- typical flow: Terraform creates the EC2, Ansible installs Docker on it
```

---

## 7. Risk register

| Risk | Mitigation |
|---|---|
| Architecture ceremony stalls the MVP | Layers strict, contents thin. Use cases are functions. Ship Stage 1 before adding any pattern not already in the scaffold. |
| Corpus never gets imported | Build the importer in Stage 1, not Stage 6. Import 20 questions on day one to prove the pipeline. |
| Spaced repetition built but unused | Ship Stage 1 and use it for a full week first. If browsing alone is enough, Stage 2 can wait. |
| Community opened before moderation is ready | Stage 5 ships moderation queue, duplicate detection and rate limiting together or not at all. |
| Multi-tenancy bugs leak data between friends | Stage 4 begins with an audit of every query for `userId` scoping. Add an integration test that seeds two users and asserts isolation. |
| Free-tier Mongo connection exhaustion | `globalThis` client cache is already in `composition/mongo-client.ts`. Keep `maxPoolSize` at 10. |

---

## 8. First session with Claude Code

Suggested opening prompt:

> Read `CLAUDE.md`, `ARCHITECTURE.md` and `PROJECT_PLAN.md`. We are at Stage 0.
> Set up the Next.js project around the existing `src/` scaffold, get
> `tests/questions.test.ts` passing under Vitest, and add the ESLint rule
> enforcing module boundaries. Do not add features beyond Stage 0.

Then, Stage 1 in this order: importer → seed 20 real questions → browse page →
detail page. Resist building the UI first; without data the filters cannot be
designed honestly.
