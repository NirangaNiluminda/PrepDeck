# Question corpus

One question per file. The importer reads every `.md` file here except this
README and files whose names start with `_`.

```bash
npm run import-questions -- --dry-run      # show what would change
npm run import-questions -- --publish      # write, publishing new questions
```

Re-running is safe. Questions are matched by **slug**, which is the file name
(`terraform-vs-ansible.md` → `terraform-vs-ansible`) unless the front-matter
sets `slug:`. Edit a file and re-import to update its question in place.
Renaming a file changes its slug, so the importer treats it as a new question.

The folder mirrors the `topic` in the front-matter. `npm test` checks that
they match and that every file imports cleanly.

## Format

```markdown
---
topic: devops/iac                 # slug path, up to 4 levels
difficulty: medium                # easy | medium | hard
type: short-answer                # short-answer | flashcard | mcq | code
tags: [terraform, ansible]        # up to 10
source: mock-interview-2026-01    # optional: where it came from
---

## Question
The question, in markdown.

## Answer
The model answer, in markdown. Code blocks are fine.

## Key points
- what a good answer must mention
- one per bullet

## Explanation
Optional background.

## References
- https://optional.example/links

## Options
- [x] MCQ only: the one correct option
- [ ] a wrong option
```

## Starter content

Files with `source: starter-seed` were written to prove the pipeline and give
the browse page real data. Rewrite them in your own words or replace them with
questions from your transcripts. The rewriting is the revision.
