import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IEntryModel extends mongoose.Document {
  date: Date,
  value: number,
  remunerator: string,
  category: string,
  info: string,
  changed: Date,
  dummy: boolean
};

const schema = new Schema({
  date: Date,
  value: Number,
  remunerator: String,
  category: String,
  info: String,
  changed: Date,
  dummy: Boolean
});

export const Entry = mongoose.model<IEntryModel>("bill", schema);