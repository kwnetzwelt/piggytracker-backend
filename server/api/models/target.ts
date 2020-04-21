import mongoose from 'mongoose';
import { ICategoryAcount } from './categoryaccount';

const Schema = mongoose.Schema;


export interface ITargetModel extends mongoose.Document {
  totals: ICategoryAcount[];
  tid: number
};

const schema = new Schema({
    totals: Array,
    tid: {type:Number, unique:true}
});

export const TargetModel = mongoose.model<ITargetModel>("target", schema);
