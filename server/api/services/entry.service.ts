import { Types as mongooseTypes } from 'mongoose';
import L from '../../common/logger'
import * as HttpStatus from 'http-status-codes';
import * as errors from "../../common/errors";
import { Entry, IEntryModel } from '../models/entry';
import { PagingResult } from '../../common/paging.result';

export class EntrysService {
  async updated(fromUser: string, updatedAt: Date):Promise<IEntryModel[]> {
    L.info('fetch entries since');
    const docs = await Entry
      .find({fromUser,updatedAt:{$gt : updatedAt}})
      .lean()
      .exec() as IEntryModel[];

    return docs;
  }

  async all(fromUser: string, perPage: number, page: number): Promise<PagingResult<IEntryModel>> {
    L.info('fetch all entries');

    const docs = await Entry
      .find({ fromUser,deleted: false })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean()
      .exec() as IEntryModel[];

    const countResult = await Entry
      .find({ fromUser }).count();
    return { data: docs, page, total: countResult };
  }

  async byId(id: string, fromUser: string): Promise<IEntryModel> {
    L.info(`fetch Entry with id ${id}`);

    if (!mongooseTypes.ObjectId.isValid(id)) {
      throw new errors.HttpError(HttpStatus.BAD_REQUEST);
    }

    const doc = await Entry
      .findOne({ _id: id, fromUser,deleted: false })
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

  async patch(id: string, fromUser: string, EntryData: IEntryModel): Promise<IEntryModel> {
    L.info(`update Entry with id ${id} with data ${EntryData}`);

    const doc = await Entry
      .findOneAndUpdate({ _id: id, fromUser }, { $set: EntryData }, { new: true })
      .lean()
      .exec() as IEntryModel;

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc;
  }

  async remove(id: string, fromUser: string): Promise<Pick<IEntryModel, "info" | "_id" | "date" | "value" | "remunerator" | "category" | "changed" | "dummy">> {
    L.info(`delete Entry with id ${id}`);

    const doc = await Entry
      .findOneAndUpdate({ _id: id, fromUser,deleted: false }, {deleted: true}, {new:true})
      .exec() as IEntryModel;

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc;
  }
  async export(fromUser: string): Promise<IEntryModel[]>
  {
    const docs = await Entry.
      find({fromUser,deleted:false}).lean().exec() as IEntryModel[];
    return docs;
  }

  async clearExcept( ids:string[], fromUser: string): Promise<number>
  {
    const allFromUser = await Entry.find({fromUser, _id: {$nin: ids}}).lean().exec() as IEntryModel[];
    for (let index = 0; index < allFromUser.length; index++) {
      const element = allFromUser[index];
      await this.remove(element._id,fromUser);
      
    }
    return allFromUser.length;
  }
}

export default new EntrysService();