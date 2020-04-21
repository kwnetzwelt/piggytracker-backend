import L from '../../common/logger'
import { IUserModel, User } from "../models/user";

export class UserService {
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