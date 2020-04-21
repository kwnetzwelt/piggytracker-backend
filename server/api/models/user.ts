import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IUserModel extends mongoose.Document {
  username: string;
  fullname: string;
  password: string;
  avatarUrl: string;
};

const schema = new Schema({
  username:String,
  fullname:String,
  password:String,
  avatarUrl:String
});

export const User = mongoose.model<IUserModel>("user", schema);