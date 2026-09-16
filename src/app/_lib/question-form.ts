import { parseOptionList } from '@/modules/importer';
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  type QuestionContent,
  type QuestionDetail,
  type TopicNode,
} from '@/modules/questions';
import { type Result, ok, err, validationError } from '@/shared/result';

/** Exactly what the admin form's fields hold: raw strings, before any parsing. */
export interface QuestionFormValues {
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
  readonly topicPath: string;
  readonly tags: string;
  readonly modelAnswer: string;
  readonly keyPoints: string;
  readonly explanation: string;
  readonly references: string;
  readonly options: string;
  readonly slug: string;
  readonly source: string;
}

export interface QuestionFormState {
  readonly error?: string;
  /** Echoed back on failure so a rejected submission keeps what was typed. */
  readonly values?: QuestionFormValues;
}

export const EMPTY_FORM: QuestionFormValues = {
  stem: '',
  type: 'short-answer',
  difficulty: 'medium',
  topicPath: '',
  tags: '',
  modelAnswer: '',
  keyPoints: '',
  explanation: '',
  references: '',
  options: '',
  slug: '',
  source: '',
};

export function readQuestionForm(formData: FormData): QuestionFormValues {
  const field = (name: keyof QuestionFormValues) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
  };
  return {
    stem: field('stem'),
    type: field('type'),
    difficulty: field('difficulty'),
    topicPath: field('topicPath'),
    tags: field('tags'),
    modelAnswer: field('modelAnswer'),
    keyPoints: field('keyPoints'),
    explanation: field('explanation'),
    references: field('references'),
    options: field('options'),
    slug: field('slug'),
    source: field('source'),
  };
}

// One item per line; a leading "- " is tolerated so pasted markdown lists work.
const lines = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.trim().replace(/^[-*+]\s+/, ''))
    .filter(Boolean);

/** Shape only. Content rules (lengths, one correct option, link format) are the entity's. */
export function toQuestionContent(values: QuestionFormValues): Result<QuestionContent> {
  const type = QUESTION_TYPES.find((t) => t === values.type);
  if (!type) return err(validationError('Choose a question type'));
  const difficulty = DIFFICULTIES.find((d) => d === values.difficulty);
  if (!difficulty) return err(validationError('Choose a difficulty'));

  // The options field stays in the form while hidden, so switching type away
  // from MCQ and back doesn't lose them; it only counts for MCQs.
  const options = type === 'mcq' ? parseOptionList(values.options) : ok(undefined);
  if (!options.ok) return options;

  return ok({
    stem: values.stem,
    type,
    difficulty,
    topicPath: values.topicPath,
    tags: values.tags.split(','),
    slug: values.slug,
    source: values.source,
    answer: {
      modelAnswer: values.modelAnswer,
      keyPoints: lines(values.keyPoints),
      explanation: values.explanation,
      references: lines(values.references),
    },
    options: options.value,
  });
}

export function toFormValues(question: QuestionDetail): QuestionFormValues {
  const { answer } = question;
  return {
    stem: question.stem,
    type: question.type,
    difficulty: question.difficulty,
    topicPath: question.topicPath,
    tags: question.tags.join(', '),
    modelAnswer: answer?.modelAnswer ?? '',
    keyPoints: answer?.keyPoints.join('\n') ?? '',
    explanation: answer?.explanation ?? '',
    references: answer?.references?.join('\n') ?? '',
    options:
      question.options
        ?.map((o) => `[${o.id === answer?.correctOptionId ? 'x' : ' '}] ${o.text}`)
        .join('\n') ?? '',
    slug: question.slug ?? '',
    source: question.source ?? '',
  };
}

export const flattenTopics = (nodes: readonly TopicNode[]): string[] =>
  nodes.flatMap((node) => [node.path, ...flattenTopics(node.children)]);
