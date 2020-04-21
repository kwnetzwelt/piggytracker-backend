import { createHmac } from 'crypto';
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

export function hashPassword(password: string) {
  const hash = createHmac('sha256', process.env.PWD_SALT)
    .update(password)
    .digest('hex');
  return hash.trim();
}
