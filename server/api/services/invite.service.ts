import { Types as mongooseTypes } from 'mongoose';
import L from '../../common/logger'
import * as HttpStatus from 'http-status-codes';
import * as errors from "../../common/errors";
import { Entry, IEntryModel } from '../models/entry';

export class InviteService {

  

  async create(EntryData: IEntryModel): Promise<IEntryModel> {
    /*L.info(`create Entry with data ${EntryData}`);

    const entry = new Entry(EntryData);

    const doc = await entry.save() as IEntryModel;

    return doc;*/
  }

  async consume(id: string, fromUser: string, EntryData: IEntryModel): Promise<IEntryModel> {
    /*L.info(`update Entry with id ${id} with data ${EntryData}`);

    const doc = await Entry
      .findOneAndUpdate({ _id: id, fromUser }, { $set: EntryData }, { new: true })
      .lean()
      .exec() as IEntryModel;

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);
    return doc;
    */
  }

  async remove(id: string, fromUser: string): Promise<Pick<IEntryModel, "info" | "_id" | "date" | "value" | "remunerator" | "category" | "changed" | "dummy">> {
    /*L.info(`delete Entry with id ${id}`);

    const doc = await Entry
      .findOneAndRemove({ _id: id, fromUser })
      .lean()
      .exec();

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc;*/
  }
}

export default new EntrysService();