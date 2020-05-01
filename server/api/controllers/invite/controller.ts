import InvitesService from '../../services/invite.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile } from '../../models/user';
import { IInviteModel, ResponseModel, Invite } from '../../models/invite';

export class Controller {

  
  async consume(req:Request, res:Response, next:NextFunction) {
      res.status(HttpStatus.NOT_IMPLEMENTED);
  }
  async create(req: Request, res: Response, next: NextFunction) {
    res.status(HttpStatus.NOT_IMPLEMENTED);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    res.status(HttpStatus.NOT_IMPLEMENTED);
  }

}

export default new Controller();
