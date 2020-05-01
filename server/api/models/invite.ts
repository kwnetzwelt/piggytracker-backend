import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface CreateOrUpdateModel {
  code: string;
}

export interface ResponseModel extends CreateOrUpdateModel {
  _id: string; 
  fromUser: string;
  expires: Date;
  code: string;
}

export interface IInviteModel extends mongoose.Document {
  fromUser: string;
  expires: Date;
  code: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const schema = new Schema({
  code: {type:String, required: true},
  expires: { type: Number, format:"date", required:true },
  fromUser: { type: String, required: true },
}, { timestamps: true });

schema.index({code: 1 }, { unique: true });

export const Invite = mongoose.model<IInviteModel>("invite", schema);
