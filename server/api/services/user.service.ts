import { Types as mongooseTypes } from 'mongoose';
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
}

export default new UserService();