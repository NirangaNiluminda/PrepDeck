// Mirrors the limits in '@/modules/exams/domain/exam-config.ts'. Duplicated
// rather than imported so the exam builder form (a Client Component) never
// imports '@/modules/exams', whose index.ts also exports the Mongo adapter.
// The real enforcement is server-side in ExamSession.start regardless — this
// is only for the input's min/max, a UX nicety, not a security boundary.
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 100;
export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 240;
