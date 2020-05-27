import { Types as mongooseTypes } from 'mongoose';
import L from '../../common/logger'
import * as HttpStatus from 'http-status-codes';
import * as errors from "../../common/errors";
import { Remunerator, IRemuneratorModel,RemuneratorArrayResponse } from '../models/remunerator';

export class RemuneratorService {
  
  async all(fromUser: string): Promise<RemuneratorArrayResponse> {
    L.info('fetch all entries for user');

    const docs = await Remunerator
      .find({ fromUser })
      .limit(256)
      .lean()
      .exec() as IRemuneratorModel[];

    return { data: docs } as RemuneratorArrayResponse;
  }

  async create(remuneratorData: IRemuneratorModel): Promise<void> {
    L.info(`create remunerator entry with data ${remuneratorData}`);

    const doc = await Remunerator
      .findOne({ name: remuneratorData.name, fromUser: remuneratorData.fromUser})
      .exec() as IRemuneratorModel;
    if(!doc)
    {

      const entry = new Remunerator(remuneratorData);
      await entry.save() as IRemuneratorModel;
    }else
    {
      doc.offset = remuneratorData.offset;
      await doc.save() as IRemuneratorModel;
    }
  }
  

}

export default new RemuneratorService();