import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IRemuneratorModel extends mongoose.Document {
  name: string;
  offset: number;
  fromUser: string;
}

export interface RemuneratorArrayResponse {
  data: IRemuneratorModel[];
}
const schema = new Schema({
  fromUser: String,
  offset: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: ""
  },
}, { timestamps: true });

export const Remunerator = mongoose.model<IRemuneratorModel>("remunerators", schema);