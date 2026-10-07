import type { IndexDescription } from 'mongodb';
import type { StudyPackStatus } from '../../domain/study-pack';

export interface StudyPackDocument {
  _id: string;
  userId: string;
  name: string;
  topicPaths: string[];
  difficulties: string[];
  status: StudyPackStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const STUDY_PACK_INDEXES: IndexDescription[] = [
  { key: { userId: 1, status: 1, createdAt: -1 }, name: 'by_user_status' },
];
