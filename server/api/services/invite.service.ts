import { Types as mongooseTypes } from 'mongoose';
import L from '../../common/logger'
import * as HttpStatus from 'http-status-codes';
import * as errors from "../../common/errors";
import { IInviteModel,Invite,CreateOrUpdateModel } from '../models/invite';

export class InvitesService {

  async create(InviteData: IInviteModel): Promise<IInviteModel> {
    L.info(`create Invite with data ${InviteData}`);

    const invite = new Invite(InviteData);

    const doc = await invite.save() as IInviteModel;

    return doc;
    return Promise.reject();
  }

  async consume(id: string, fromUser: string, InviteData: IInviteModel): Promise<IInviteModel> {
    /*L.info(`update Invite with id ${id} with data ${InviteData}`);

    const doc = await Invite
      .findOneAndUpdate({ _id: id, fromUser }, { $set: InviteData }, { new: true })
      .lean()
      .exec() as IInviteModel;

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);
    return doc;
    */
   return Promise.reject();
  }

  /**
   * Deletes an invite with the given code and provided the fromUser field is correct. 
   * @param code 
   * @param fromUser 
   */
  async remove(code: string, fromUser: string): Promise<Pick<IInviteModel, "fromUser" | "expires" | "code" >> {
    L.info(`delete Invite with code ${code}`);

    const doc = await Invite
      .findOneAndRemove({ code: code, fromUser:fromUser })
      .lean()
      .exec();

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc;
    return Promise.reject();
  }
}

export default new InvitesService();
