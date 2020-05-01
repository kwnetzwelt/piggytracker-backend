import L from '../../common/logger'
import { IUserModel, User } from "../models/user";
import { MongoError } from 'mongodb';

interface GoogleOAuth2Profile {
  provider: string;
  id: string;
  displayName: string;
  emails: {value: string}[];
}

export class UserService {
  async findOrCreate(profile: GoogleOAuth2Profile, callback: (err: any, user: any) => any) {
    const existingUser = await User
    .findOne({ provider: profile.provider, oauthId: profile.id })
    .lean()
    .exec() as IUserModel;

    if (existingUser) return callback(null, existingUser);

    const user = new User({
      username: profile.emails[0].value,
      fullname: profile.displayName,
      password: null,
      provider: profile.provider,
      oauthId: profile.id
    });
    const newUser = await user.save().catch((err: MongoError) => {
      L.error(err);
      return callback(err, null);
    }) as IUserModel;

    if (newUser) return callback(null, newUser);
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