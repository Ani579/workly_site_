import { Schema, models, model, Document, Types } from 'mongoose';

export interface IJob extends Document {
  companyId: Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel?: string;
  location?: string;
  type: 'INTERNSHIP' | 'FULL_TIME';
  isDemo: boolean;
}

const JobSchema = new Schema<IJob>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [String],
    experienceLevel: String,
    location: String,
    type: { type: String, enum: ['INTERNSHIP', 'FULL_TIME'], default: 'FULL_TIME' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Job = models.Job || model<IJob>('Job', JobSchema);

