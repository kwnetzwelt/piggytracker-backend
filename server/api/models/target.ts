import mongoose from 'mongoose';
import { ICategoryAcount } from './categoryaccount';

const Schema = mongoose.Schema;

export interface CreateOrUpdateModel {
  totals: ICategoryAcount[];
  tid: number;
}

export interface ResponseModel extends CreateOrUpdateModel {
  _id: string;
}

export interface ITargetModel extends mongoose.Document {
  totals: ICategoryAcount[];
  tid: number;
  fromUser: string;
}

const schema = new Schema({
    totals: [{
      category: String,
      value: Number,
    }],
    tid: {type:Number, unique:true},
    fromUser: String,
});

export const Target = mongoose.model<ITargetModel>("target", schema);
