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

    const entry = new Remunerator(remuneratorData);

    const doc = await entry.save() as IRemuneratorModel;

    
  }

}

export default new RemuneratorService();