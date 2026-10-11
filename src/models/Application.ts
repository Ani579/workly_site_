import { Schema, models, model, Document, Types } from 'mongoose';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'REJECTED';
export type ApplicationSource = 'APPLIED' | 'RECRUITER_SHORTLIST';

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  studentProfileId: Types.ObjectId;
  status: ApplicationStatus;
  source: ApplicationSource;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    studentProfileId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    status: { type: String, enum: ['APPLIED', 'SHORTLISTED', 'REJECTED'], default: 'APPLIED' },
    // "APPLIED" = student applied themselves, "RECRUITER_SHORTLIST" = added by recruiter from match
    source: { type: String, enum: ['APPLIED', 'RECRUITER_SHORTLIST'], default: 'APPLIED' },
  },
  { timestamps: true }
);

// Compound unique index — a student can only have one application per job
ApplicationSchema.index({ jobId: 1, studentProfileId: 1 }, { unique: true });
ApplicationSchema.index({ studentProfileId: 1 });

export const Application = models.Application || model<IApplication>('Application', ApplicationSchema);

