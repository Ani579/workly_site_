import { Schema, models, model, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  provider: string;
  url: string;
  skillTag: string;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    provider: { type: String, required: true },
    url: { type: String, required: true },
    skillTag: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

CourseSchema.index({ title: 1, provider: 1 }, { unique: true });

export const Course = models.Course || model<ICourse>('Course', CourseSchema);

