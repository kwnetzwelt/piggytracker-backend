import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IEntryModel extends mongoose.Document {
  date: Date,
  value: number,
  remunerator: string,
  category: string,
  info: string,
  changed: Date,
  dummy: boolean,
  fromUser: String,
};

const schema = new Schema({
  date: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  },
  value: {
    type: Number,
    default: 0
  },
  remunerator: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: ""
  },
  info: {
    type: String,
    default: ""
  },
  changed: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  },
  dummy: Boolean,
  fromUser:String,
}, { timestamps: true });

export const Entry = mongoose.model<IEntryModel>("bill", schema);