import { describe, it, expect } from 'vitest';
import { fixedClock, sequentialIds } from '@/shared/system-adapters';
import { parseQuestionMarkdown, parseOptionList } from '@/modules/importer';
import { InMemoryQuestionRepository, importQuestions } from '@/modules/questions';

// The example from PROJECT_PLAN.md §6, verbatim.
const PLAN_EXAMPLE = `---
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
`;

const parse = (source: string, defaultSlug = 'terraform-vs-ansible') =>
  parseQuestionMarkdown(source, { defaultSlug });

const errorOf = (source: string) => {
  const result = parse(source);
  return result.ok ? null : result.error.message;
};

const withBody = (body: string, frontMatter = 'topic: devops/iac\ndifficulty: easy\ntype: short-answer') =>
  `---\n${frontMatter}\n---\n\n${body}`;

describe('parseQuestionMarkdown', () => {
  it('parses the documented format, taking the slug from the file name', () => {
    const result = parse(PLAN_EXAMPLE);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      slug: 'terraform-vs-ansible',
      stem: 'What is the difference between Terraform and Ansible, and when would you use each?',
      type: 'short-answer',
      difficulty: 'medium',
      topicPath: 'devops/iac',
      tags: ['terraform', 'ansible', 'idempotency'],
      source: 'mock-interview-2026-01',
    });
    expect(result.value.answer.modelAnswer).toMatch(/^Terraform provisions infrastructure/);
    expect(result.value.answer.keyPoints).toHaveLength(4);
  });

  it('lets front-matter override the slug and accepts comma-separated tags', () => {
    const result = parse(
      withBody('## Question\nWhat is a pod?\n\n## Answer\nThe smallest deployable unit.', 'slug: k8s-pod\ntopic: devops/k8s\ndifficulty: easy\ntype: flashcard\ntags: kubernetes, pods'),
    );

    expect(result.ok && result.value.slug).toBe('k8s-pod');
    expect(result.ok && result.value.tags).toEqual(['kubernetes', 'pods']);
  });

  it('reads MCQ options, lettering them and marking the ticked one correct', () => {
    const result = parse(
      withBody(
        '## Question\nWhich status means forbidden?\n\n## Answer\n403.\n\n## Options\n- [ ] 401 Unauthorized\n- [x] 403 Forbidden\n- [ ] 404 Not Found',
        'topic: web/http\ndifficulty: easy\ntype: mcq',
      ),
    );

    expect(result.ok && result.value.options).toEqual([
      { id: 'a', text: '401 Unauthorized', correct: false },
      { id: 'b', text: '403 Forbidden', correct: true },
      { id: 'c', text: '404 Not Found', correct: false },
    ]);
  });

  it('keeps "## " lines inside a code block as part of the answer', () => {
    const result = parse(
      withBody('## Question\nShow a markdown heading in code.\n\n## Answer\n```md\n## Not a section\n```\nDone.'),
    );

    expect(result.ok && result.value.answer.modelAnswer).toBe('```md\n## Not a section\n```\nDone.');
  });

  it('parses Windows line endings the same way', () => {
    const result = parse(PLAN_EXAMPLE.replace(/\n/g, '\r\n'));

    expect(result.ok && result.value.answer.keyPoints).toHaveLength(4);
  });

  it('joins an indented continuation line onto the previous bullet', () => {
    const result = parse(
      withBody('## Question\nWhat is idempotency?\n\n## Answer\nSame result.\n\n## Key points\n- running it twice\n  changes nothing more'),
    );

    expect(result.ok && result.value.answer.keyPoints).toEqual(['running it twice changes nothing more']);
  });

  it('rejects a misspelled front-matter key instead of ignoring it', () => {
    expect(errorOf(PLAN_EXAMPLE.replace('difficulty:', 'dificulty:'))).toMatch(/dificulty/);
  });

  it('rejects an unknown difficulty', () => {
    expect(errorOf(PLAN_EXAMPLE.replace('difficulty: medium', 'difficulty: extreme'))).toMatch(/difficulty/);
  });

  it('rejects an unknown section and names the line', () => {
    expect(errorOf(PLAN_EXAMPLE.replace('## Key points', '## Keypoints'))).toMatch(/Line 16: unknown section "## Keypoints"/);
  });

  it('rejects a file without an answer', () => {
    expect(errorOf(withBody('## Question\nWhat is DNS?'))).toMatch(/Missing a "## Answer" section/);
  });

  it('rejects key points that are not a bullet list', () => {
    expect(
      errorOf(withBody('## Question\nWhat is DNS?\n\n## Answer\nNames to IPs.\n\n## Key points\nresolution')),
    ).toMatch(/Key points must be a bullet list/);
  });

  it('rejects a reference that is not a URL', () => {
    expect(
      errorOf(withBody('## Question\nWhat is DNS?\n\n## Answer\nNames to IPs.\n\n## References\n- see the RFC')),
    ).toMatch(/References must be URLs/);
  });

  it('rejects a file without front-matter and invalid YAML', () => {
    expect(errorOf('## Question\nWhat is DNS?')).toMatch(/must start with front-matter/);
    expect(errorOf('---\ntags: [unclosed\n---\n## Question\nx')).toMatch(/not valid YAML/);
  });

  it('rejects text before the first section', () => {
    expect(errorOf(withBody('# A title\n\n## Question\nWhat is DNS?\n\n## Answer\nNames.'))).toMatch(
      /text before the first "## " section/,
    );
  });
});

describe('parseOptionList', () => {
  it('accepts lines with or without a bullet and rejects anything else', () => {
    const good = parseOptionList('[x] Yes\n- [ ] No\n\n');
    const bad = parseOptionList('[x] Yes\nMaybe');

    expect(good.ok && good.value.map((o) => o.correct)).toEqual([true, false]);
    expect(!bad.ok && bad.error.message).toMatch(/"Maybe"/);
  });
});

describe('markdown import end to end', () => {
  it('imports a file, then reports the same file unchanged on the next run', async () => {
    const deps = {
      questions: new InMemoryQuestionRepository(),
      clock: fixedClock('2026-01-15T10:00:00Z'),
      ids: sequentialIds('q'),
    };
    const parsed = parse(PLAN_EXAMPLE);
    if (!parsed.ok) throw new Error(parsed.error.message);
    const run = () =>
      importQuestions({ items: [parsed.value], authorId: 'founder', publish: true, dryRun: false }, deps);

    const first = await run();
    const second = await run();

    expect(first.outcomes[0]).toMatchObject({ kind: 'created', status: 'published' });
    expect(second.outcomes[0]).toEqual({ slug: 'terraform-vs-ansible', kind: 'unchanged' });
  });
});
