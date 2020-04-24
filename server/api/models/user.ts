import { createHmac } from 'crypto';
import mongoose from 'mongoose';
import { Profile } from 'passport';

const Schema = mongoose.Schema;

export interface IUserModel extends mongoose.Document {
  username: string;
  fullname: string;
  password: string;
  avatarUrl?: string;
  groupId?: string,
  groupName?: string,
};

const schema = new Schema({
  username: String,
  fullname: String,
  password: String,
  avatarUrl: String,
  groupId: String,
  groupName: String,
});

export const User = mongoose.model<IUserModel>("user", schema);

export function hashPassword(password: string) {
  const hash = createHmac('sha256', process.env.PWD_SALT)
    .update(password)
    .digest('hex');
  return hash.trim();
}

export interface UserProfile {
  fullname: string,
  username: string,
  group: string,
}

export function toProfile(user: IUserModel): UserProfile {
  return {
    fullname: user.fullname,
    username: user.username,
    group: (user.groupId && user.groupId.length > 0) ? user.groupId : String(user._id)
  }
}
