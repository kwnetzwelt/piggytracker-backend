import L from '../../common/logger'
import * as HttpStatus from 'http-status-codes';
import * as errors from '../../common/errors';
import { IUserModel, User } from "../models/user";
import { MongoError } from 'mongodb';

interface GoogleOAuth2Profile {
  /** Google User Id */
  sub: string;
  /** Google full name */
  name?: string;
  email?: string;
}

export enum OAuthProvider {
  Google = "google",
  Keycloak = "keycloak",
}

export class UserService {
  async findOrCreate(provider: OAuthProvider, profile: GoogleOAuth2Profile) {
    const existingUser = await User
      .findOne({ provider: provider.toString(), oauthId: profile.sub })
      .exec() as IUserModel;

    if (existingUser) return existingUser;

    const user = new User({
      username: profile.email,
      fullname: profile.name,
      password: null,
      provider: provider.toString(),
      oauthId: profile.sub
    });
    const newUser = await user.save().catch((err: MongoError) => {
      L.error(err);
      throw new errors.HttpError(HttpStatus.BAD_REQUEST, err);
    }) as IUserModel;

    if (newUser) return newUser;
  }

  async clearUserGroup(id: string): Promise<IUserModel> {
    L.info(`clear user groupe for user with id ${id}`);
    const user = await User.findById(id);
    user.groupId = "";
    user.groupName = "";

    const result = await user.save();
    return result;
  }
  async findById(id: string): Promise<IUserModel> {
    L.info(`fetch user with id ${id}`);

    const doc = await User
      .findOne({ _id: id })
      .lean()
      .exec() as IUserModel;

    return doc;
  }
  async findByName(username: string): Promise<IUserModel> {
    L.info(`fetch user with name ${username}`);
    const user = await User
      .findOne({ username })
      .lean()
      .exec() as IUserModel;
    return user;
  }

  async deleteByName(username: string): Promise<any> {
    L.info(`delete user with name ${username}`);

    return await User
      .findOneAndRemove({ username })
      .lean()
      .exec()
  }
  async setUserGroup(invitedUserId: string, userGroupId: string): Promise<IUserModel> {
    L.info(`set user group on user ${invitedUserId}`);
    const invitingUser = await User.findById(userGroupId);
    const invitedUser = await User.findById(invitedUserId);
    invitedUser.groupId = invitingUser._id;
    invitedUser.groupName = invitingUser.fullname;
    const result = await invitedUser.save();
    return (result as IUserModel);
  }
}

export default new UserService();