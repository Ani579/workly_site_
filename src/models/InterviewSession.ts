import { Schema, models, model, Document, Types } from 'mongoose';

export interface IInterviewQuestion {
  question: string;
  answer?: string;
  score?: number | null;
  feedback?: string;
  betterAnswerTip?: string;
}

export interface IInterviewSession extends Document {
  studentProfileId: Types.ObjectId;
  role: string;
  questions: IInterviewQuestion[];
  overallScore?: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    score: { type: Number, default: null, min: 0, max: 10 },
    feedback: { type: String, default: '' },
    betterAnswerTip: { type: String, default: '' },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    studentProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    role: { type: String, required: true },
    questions: [InterviewQuestionSchema],
    overallScore: { type: Number, default: null, min: 0, max: 10 },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED'],
      default: 'IN_PROGRESS',
    },
  },
  { timestamps: true }
);

export const InterviewSession =
  models.InterviewSession ||
  model<IInterviewSession>('InterviewSession', InterviewSessionSchema);

