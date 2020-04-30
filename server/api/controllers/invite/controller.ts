import InviteService from '../../services/entry.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile } from '../../models/user';
import { IInviteModel, ResponseModel, Invite } from '../../models/invite';

export class Controller {

  
  async consume(req:Request, res:Response, next:NextFunction) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
  }
  async create(req: Request, res: Response, next: NextFunction) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
  }

}

export default new Controller();
