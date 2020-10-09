import RemuneratorService from '../../services/remunerator.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile } from '../../models/user';
import { IRemuneratorModel } from '../../models/remunerator';



export class Controller {


  private static extractWriteableFieldsFromRequestBody(req: Request ) {
    const body = (req.body || {});
    return {
      name: body.remunerator.name,
      offset: body.remunerator.offset,
    } as IRemuneratorModel;
  }


  async all(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RemuneratorService.all((req.user as UserProfile).groupId);
      return res.status(HttpStatus.OK).json(result);
    }
    catch (err) {
      return next(err);
    }
  }
  
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const fields = Controller.extractWriteableFieldsFromRequestBody(req);
      fields.fromUser = (req.user as UserProfile).groupId;

      await RemuneratorService.create(fields);

      return res.status(HttpStatus.OK).json({message:"OK"});
    }
    catch (err) {
      return next(err);
    }
  }

}

export default new Controller();
