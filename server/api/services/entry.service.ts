import { Types as mongooseTypes } from 'mongoose';
import L from '../../common/logger'
import * as HttpStatus from 'http-status-codes';
import * as errors from "../../common/errors";

import { Entry, IEntryModel } from '../models/entry';

export class EntrysService {

  async all(): Promise<IEntryModel[]> {
    L.info('fetch all Entrys');

    const docs = await Entry
      .find()
      .lean()
      .exec() as IEntryModel[];

    return docs;
  }

  async byId(id: string, fromUser: string): Promise<IEntryModel> {
    L.info(`fetch Entry with id ${id}`);

    if (!mongooseTypes.ObjectId.isValid(id)) {
      throw new errors.HttpError(HttpStatus.BAD_REQUEST);
    }

    const doc = await Entry
      .findOne({ _id: id, fromUser })
      .lean()
      .exec() as IEntryModel;

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc;
  }

  async create(EntryData: IEntryModel): Promise<IEntryModel> {
    L.info(`create Entry with data ${EntryData}`);

    const entry = new Entry(EntryData);

    const doc = await entry.save() as IEntryModel;

    return doc;
  }

  async patch(id: string, EntryData: IEntryModel): Promise<IEntryModel> {
    L.info(`update Entry with id ${id} with data ${EntryData}`);

    const doc = await Entry
      .findOneAndUpdate({ _id: id }, { $set: EntryData }, { new: true })
      .lean()
      .exec() as IEntryModel;

    return doc;
  }

  async remove(id: string): Promise<Pick<IEntryModel, "info" | "_id" | "date" | "value" | "remunerator" | "category" | "changed" | "dummy">> {
    L.info(`delete Entry with id ${id}`);

    return await Entry
      .findOneAndRemove({ _id: id })
      .lean()
      .exec()
  }
}

export default new EntrysService();