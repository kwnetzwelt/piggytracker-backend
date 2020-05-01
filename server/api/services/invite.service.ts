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

  
  /**
   * Deletes an invite with the given code and provided the fromUser field is correct. 
   * @param code 
   * @param fromUser 
   */
  async remove(code: string): Promise<Pick<IInviteModel, "fromUser" | "expires" | "code" >> {
    L.info(`delete Invite with code ${code}`);

    const doc = await Invite
      .findOneAndRemove({ code: code })
      .lean()
      .exec();

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc as IInviteModel;
    return Promise.reject();
  }
}

export default new InvitesService();
