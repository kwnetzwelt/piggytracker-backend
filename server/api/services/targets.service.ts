import { Types as mongooseTypes } from 'mongoose';
import * as HttpStatus from 'http-status-codes';
import L from '../../common/logger';
import * as errors from '../../common/errors';
import { MongoError } from 'mongodb';

import { Target, ITargetModel } from '../models/target';

export class TargetsService {
  async all(): Promise<ITargetModel[]> {
    L.info('fetch all targets');

    const docs = await Target
      .find()
      .lean()
      .exec() as ITargetModel[];

    return docs;
  }

  async byId(id: string, fromUser: string): Promise<ITargetModel> {
    L.info(`fetch target with id ${id}`);

    if (!mongooseTypes.ObjectId.isValid(id)) throw new errors.HttpError(HttpStatus.BAD_REQUEST);

    const doc = await Target
      .findOne({ _id: id, fromUser })
      .lean()
      .exec() as ITargetModel;

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc;
  }

  async create(targetData: ITargetModel): Promise<ITargetModel> {
    L.info(`create target with data ${targetData}`);

    const target = new Target(targetData);

    const doc = await target.save().catch((err: MongoError) => {
      L.error(err);
      throw new errors.HttpError(HttpStatus.BAD_REQUEST, err);
    }) as ITargetModel;

    return doc;
  }

  async patch(id: string, fromUser: string, targetData: ITargetModel): Promise<ITargetModel> {
    L.info(`update target with id ${id} with data ${targetData}`);

    const doc = await Target
      .findOneAndUpdate({ _id: id, fromUser }, { $set: targetData }, { new: true })
      .lean()
      .exec().catch((err: MongoError) => {
        L.error(err);
        throw new errors.HttpError(HttpStatus.BAD_REQUEST, err);
      }) as ITargetModel;

    if (!doc) throw new errors.HttpError(HttpStatus.NOT_FOUND);

    return doc;
  }

  async remove(id: string) {
    L.info(`delete target with id ${id}`);

    return await Target
      .findOneAndRemove({ _id: id })
      .lean()
      .exec();
  }
}

export default new TargetsService();
