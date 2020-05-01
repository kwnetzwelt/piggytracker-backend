import EntryService from '../../services/entry.service';
import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import { UserProfile } from '../../models/user';
import { EntryArrayResponse } from '../../models/entry';

export class Controller {

  async all(req: Request, res: Response, next: NextFunction) {
    try {
      const delta = Math.min(Math.max(0,parseInt(String(req.query.updatedMillisecondsAgo))),24*60*60*1000);
      const updatedAt = new Date(new Date().getTime() - delta);
      const result = await EntryService.updated((req.user as UserProfile).groupId,updatedAt);
      const response: EntryArrayResponse = {data: result};
      return res.status(HttpStatus.OK).json(response);
    }
    catch (err) {
      return next(err);
    }
  }

}

export default new Controller();
