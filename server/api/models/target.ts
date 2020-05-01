import mongoose from 'mongoose';
import { ICategoryAcount } from './categoryaccount';

const Schema = mongoose.Schema;

export interface CreateOrUpdateModel {
  totals: ICategoryAcount[];
  tid: number;
}

export interface ResponseModel extends CreateOrUpdateModel {
  _id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ITargetModel extends mongoose.Document {
  totals: ICategoryAcount[];
  tid: number;
  fromUser: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const schema = new Schema({
  totals: [{
    category: String,
    value: Number,
  }],
  tid: { type: Number, required: true },
  fromUser: { type: String, required: true },
}, { timestamps: true });

schema.index({ fromUser: 1, tid: 1 }, { unique: true });

export const Target = mongoose.model<ITargetModel>("target", schema);
