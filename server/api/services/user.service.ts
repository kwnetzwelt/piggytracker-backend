import L from '../../common/logger'
import { IUserModel, User } from "../models/user";

export class UserService {
  async clearUserGroup(id: string) : Promise<IUserModel> {
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
  async setUserGroup(invitedUserId:string, userGroupId:string): Promise<IUserModel>{
    L.info(`set user group on user ${invitedUserId}`);
    var invitingUser = await User.findById(userGroupId);
    var invitedUser = await User.findById(invitedUserId);
    invitedUser.groupId = invitingUser._id;
    invitedUser.groupName = invitingUser.fullname;
    const result = await invitedUser.save();
    return result as IUserModel;
  }
}

export default new UserService();