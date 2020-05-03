import { createHmac } from 'crypto';
import mongoose from 'mongoose';
import { Profile } from 'passport';

const Schema = mongoose.Schema;

export interface IUserModel extends mongoose.Document {
  username: string;
  fullname: string;
  password: string;
  avatarUrl?: string;
  groupId?: string;
  groupName?: string;
  provider?: string;
  oauthId?: string;
}

const schema = new Schema({
  username: String,
  fullname: String,
  password: String,
  avatarUrl: String,
  groupId: String,
  groupName: String,
  provider: String,
  oauthId: String,
});

export const User = mongoose.model<IUserModel>("user", schema);

export function hashPassword(password: string) {
  const hash = createHmac('sha256', process.env.JWT_KEY)
    .update(password)
    .digest('hex');
  return hash.trim();
}

export interface UserProfile {
  fullname: string;
  username: string;
  groupId: string;
  groupName: string;
  avatarUrl: string;
  id: string;
}

export function toProfile(user: IUserModel): UserProfile {
  return {
    fullname: user.fullname,
    username: user.username,
    groupId: (user.groupId && user.groupId.length > 0) ? user.groupId : String(user._id),
    groupName: (user.groupName && user.groupName.length > 0) ? user.groupName : String(user.fullname),
    avatarUrl: user.avatarUrl,
    id: String(user._id)
  }
}
