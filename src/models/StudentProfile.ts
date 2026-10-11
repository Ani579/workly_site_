import { Schema, models, model, Document, Types } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  headline?: string;
  bio?: string;
  education?: string;
  location?: string;
  resumeText?: string;
  resumeFileName?: string;
  resumeHash?: string;
  githubUsername?: string;
  profileScore?: number | null;
  scoreSummary?: string;
  strengths: string[];
  improvements: string[];
  skills: { name: string; level: number; source: 'RESUME' | 'GITHUB' }[];
  skillGaps: { name: string; priority: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }[];
  fallbackUsed: boolean;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    headline: String,
    bio: String,
    education: String,
    location: String,
    resumeText: String,
    resumeFileName: String,
    resumeHash: String,
    githubUsername: String,
    profileScore: { type: Number, default: null },
    scoreSummary: String,
    strengths: [String],
    improvements: [String],
    skills: [
      {
        name: { type: String, required: true },
        level: { type: Number, min: 0, max: 100, default: 50 },
        source: { type: String, enum: ['RESUME', 'GITHUB'], default: 'RESUME' },
      },
    ],
    skillGaps: [
      {
        name: { type: String, required: true },
        priority: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'INTERMEDIATE' },
      },
    ],
    fallbackUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

StudentProfileSchema.index({ profileScore: 1 });

export const StudentProfile = models.StudentProfile || model<IStudentProfile>('StudentProfile', StudentProfileSchema);

