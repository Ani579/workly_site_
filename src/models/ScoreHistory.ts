import { Schema, models, model, Document, Types } from 'mongoose';

export interface IScoreHistory extends Document {
  studentProfileId: Types.ObjectId;
  score: number;
  createdAt: Date;
}

const ScoreHistorySchema = new Schema<IScoreHistory>(
  {
    studentProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const ScoreHistory =
  models.ScoreHistory || model<IScoreHistory>('ScoreHistory', ScoreHistorySchema);

