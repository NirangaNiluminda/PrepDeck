import {
  DIFFICULTIES,
  QUESTION_TYPES,
  sampleQuestions,
  type Difficulty,
  type QuestionRepository,
  type QuestionType,
} from '@/modules/questions';
import type { Clock, IdGenerator } from '@/shared/ports';
import { type Result, ok } from '@/shared/result';
import { type ExamConfig } from '../domain/exam-config';
import { ExamSession } from '../domain/exam-session';
import type { ExamQuestionSnapshot } from '../domain/exam-question-snapshot';
import { type ExamRunnerView, toRunnerView } from '../ports/dto';
import type { ExamSessionRepository } from '../ports/exam-session-repository';

// ExamConfig keeps loose strings — see its own comment on why. Narrowing to
// the questions module's real unions belongs here, at the one boundary that
// actually calls into it, not in the domain type itself.
const onlyDifficulties = (values: readonly string[] | undefined): Difficulty[] | undefined =>
  values?.filter((v): v is Difficulty => (DIFFICULTIES as readonly string[]).includes(v));
const onlyQuestionTypes = (values: readonly string[] | undefined): QuestionType[] | undefined =>
  values?.filter((v): v is QuestionType => (QUESTION_TYPES as readonly string[]).includes(v));

export interface StartExamInput extends ExamConfig {
  readonly userId: string;
}

export interface StartExamDeps {
  readonly examSessions: ExamSessionRepository;
  readonly questions: QuestionRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

export async function startExam(input: StartExamInput, deps: StartExamDeps): Promise<Result<ExamRunnerView>> {
  const { userId, ...config } = input;
  const now = deps.clock.now();

  const drawn = await sampleQuestions(
    {
      topicPaths: config.topicPaths,
      difficulties: onlyDifficulties(config.difficulties),
      types: onlyQuestionTypes(config.types),
      size: config.count,
    },
    deps,
  );
  const snapshots: ExamQuestionSnapshot[] = drawn.map((q) => ({
    questionId: q.id,
    stem: q.stem,
    type: q.type,
    difficulty: q.difficulty,
    topicPath: q.topicPath,
    options: q.options?.map((o) => ({ id: o.id, text: o.text, correct: o.id === q.answer?.correctOptionId })),
    answer: {
      modelAnswer: q.answer?.modelAnswer ?? '',
      keyPoints: q.answer?.keyPoints ?? [],
      explanation: q.answer?.explanation,
      references: q.answer?.references,
    },
  }));

  const started = ExamSession.start({ id: deps.ids.next(), userId, config, snapshots, now });
  if (!started.ok) return started;

  await deps.examSessions.save(started.value);
  return ok(toRunnerView(started.value));
}
