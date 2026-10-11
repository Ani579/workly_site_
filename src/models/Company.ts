import { Schema, models, model, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  ownerUserId: Types.ObjectId;
  name: string;
  website?: string;
  description?: string;
  size?: string;
}

const CompanySchema = new Schema<ICompany>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    name: { type: String, required: true },
    website: String,
    description: String,
    size: String,
  },
  { timestamps: true }
);

export const Company = models.Company || model<ICompany>('Company', CompanySchema);

