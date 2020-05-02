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
}

export class UserService {
  async findOrCreate(provider: OAuthProvider, profile: GoogleOAuth2Profile) {
    const existingUser = await User
    .findOne({ provider: provider.toString(), oauthId: profile.sub })
    .lean()
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
}

export default new UserService();