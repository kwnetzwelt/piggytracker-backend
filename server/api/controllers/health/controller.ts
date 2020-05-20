import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

export class Controller {

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(HttpStatus.OK).json({status:'UP'});
    }
    catch (err) {
      return next(err);
    }
  }
  
}

export default new Controller();
