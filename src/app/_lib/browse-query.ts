import type { QuestionStatus, SearchQuestionsInput } from '@/modules/questions';
import type { BrowseParams } from './browse-params';

// Admins see drafts too, but archived questions were hidden on purpose and
// only come back when the Status filter asks for them.
const WORKING_SET: readonly QuestionStatus[] = ['draft', 'in-review', 'published'];

interface BrowseViewer {
  readonly isAdmin: boolean;
  /** Null when signed out; the bookmarked filter is ignored then. */
  readonly bookmarkedIds: readonly string[] | null;
}

/**
 * The search a browse URL means, minus paging. Shared with the question page
 * so its previous/next buttons walk the same list, in the same order, that
 * the reader came from.
 */
export function browseSearchInput(params: BrowseParams, viewer: BrowseViewer): Omit<SearchQuestionsInput, 'page'> {
  return {
    topicPath: params.topic,
    difficulties: params.difficulties,
    types: params.types,
    tags: params.tags,
    statuses: viewer.isAdmin && params.statuses.length === 0 ? WORKING_SET : params.statuses,
    text: params.q,
    ids: viewer.bookmarkedIds && params.bookmarked ? viewer.bookmarkedIds : undefined,
    sort: params.sort,
    viewerIsAdmin: viewer.isAdmin,
  };
}
