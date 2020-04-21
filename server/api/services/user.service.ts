import L from '../../common/logger'
import { IUserModel, User } from "../models/user";

export class UserService {
  async findById(id: string): Promise<IUserModel> {
    L.info(`fetch User with id ${id}`);

    const doc = await User
      .findOne({ _id: id })
      .lean()
      .exec() as IUserModel;

    return doc;
  }
  async findByName(username: string): Promise<IUserModel> {
    L.info(`fetch User with name ${username}`);
    const user = await User
      .findOne({ username })
      .lean()
      .exec() as IUserModel;
    return user;
  }
}

export default new UserService();