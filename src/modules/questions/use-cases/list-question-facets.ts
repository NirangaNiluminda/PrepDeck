import type { QuestionStatus } from '../domain/question';
import { type TopicNode, buildTopicTree } from '../domain/topic-tree';
import { visibleStatuses } from '../domain/visibility';
import type { QuestionRepository, TagCount } from '../ports/question-repository';

export interface ListQuestionFacetsInput {
  readonly viewerIsAdmin: boolean;
  readonly statuses?: readonly QuestionStatus[];
}

export interface QuestionFacets {
  readonly topics: readonly TopicNode[];
  readonly tags: readonly TagCount[];
}

/**
 * The browse sidebar's choices. Counted over everything the viewer may see
 * rather than narrowed by the other active filters, so options don't vanish
 * from the sidebar as soon as one of them is ticked.
 */
export async function listQuestionFacets(
  input: ListQuestionFacetsInput,
  deps: { questions: QuestionRepository },
): Promise<QuestionFacets> {
  const filter = { statuses: visibleStatuses(input.viewerIsAdmin, input.statuses) };

  const [topics, tags] = await Promise.all([
    deps.questions.countByTopic(filter),
    deps.questions.countByTag(filter),
  ]);

  return { topics: buildTopicTree(topics), tags };
}
