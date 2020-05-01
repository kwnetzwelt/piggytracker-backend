import { Types as mongooseTypes } from 'mongoose';
import L from '../../common/logger'
import * as HttpStatus from 'http-status-codes';
import * as errors from "../../common/errors";
import { IInviteModel } from '../models/invite';

export class InvitesService {

  async create(InviteData: IInviteModel): Promise<IInviteModel> {
    /*L.info(`create Invite with data ${InviteData}`);

    const invite = new Invite(InviteData);

    const doc = await invite.save() as IInviteModel;

    return doc;*/
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

  async remove(id: string, fromUser: string): Promise<Pick<IInviteModel, "_id" | "fromUser" | "expires" | "code" >> {
    /*L.info(`delete Invite with id ${id}`);

    const doc = await Invite
      .findOneAndRemove({ _id: id, fromUser })
      .lean()
      .exec();

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc;*/
    return Promise.reject();
  }
}

export default new InvitesService();
