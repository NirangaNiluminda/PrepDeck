// The module's public API. Bookmarks hold question ids only; the questions
// module stays the single source of question data.

export { setBookmark } from './use-cases/set-bookmark';
export type { SetBookmarkInput } from './use-cases/set-bookmark';
export { listBookmarkedQuestionIds } from './use-cases/list-bookmarked-question-ids';

export type { BookmarkRepository } from './ports/bookmark-repository';

// Adapters — exported for the composition root and tests only.
export { InMemoryBookmarkRepository } from './adapters/in-memory/in-memory-bookmark-repository';
export { MongoBookmarkRepository } from './adapters/mongo/mongo-bookmark-repository';
export { BOOKMARK_INDEXES } from './adapters/mongo/bookmark-document';
export type { BookmarkDocument } from './adapters/mongo/bookmark-document';
