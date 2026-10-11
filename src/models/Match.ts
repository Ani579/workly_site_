import { Schema, models, model, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  jobId: Types.ObjectId;
  studentProfileId: Types.ObjectId;
  score: number;
  reasons: string[];
  missingSkills: string[];
  explained: boolean;
}

const MatchSchema = new Schema<IMatch>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    studentProfileId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    reasons: [String],
    missingSkills: [String],
    explained: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound unique index — each student can only have one match per job
MatchSchema.index({ jobId: 1, studentProfileId: 1 }, { unique: true });
MatchSchema.index({ studentProfileId: 1, score: -1 });

export const Match = models.Match || model<IMatch>('Match', MatchSchema);

