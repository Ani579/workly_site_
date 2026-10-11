import { Schema, models, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: 'STUDENT' | 'RECRUITER' | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    image: String,
    role: { type: String, enum: ['STUDENT', 'RECRUITER', null], default: null },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);

