import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface CreateOrUpdateModel {
  date: string;
  value: number;
  remunerator: string;
  category: string;
  info: string;
}

export interface ResponseModel extends CreateOrUpdateModel {
  _id: string;
}
export interface IEntryModel extends mongoose.Document {
  date: Date;
  value: number;
  remunerator: string;
  category: string;
  info: string;
  changed: Date;
  dummy: boolean;
  fromUser: string;
  deleted: boolean;
}

export interface EntryArrayResponse {
  data: IEntryModel[];
}
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
  fromUser: String,
  deleted: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

export const Entry = mongoose.model<IEntryModel>("bill", schema);